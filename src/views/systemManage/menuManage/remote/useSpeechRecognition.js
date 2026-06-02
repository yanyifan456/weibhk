/**
 * useSpeechRecognition.js
 *
 * Web 端（医生）语音识别 Composable。
 *
 * 负责：
 *  1. 连接医生端音频 WS（ws/audio/{doctorTaskId}），采集本地麦克风 PCM 并推送
 *  2. 连接患者端音频 WS（ws/audio/{userTaskId}），通过 TRTC enableAudioFrameEvent 采集远端 PCM 并推送
 *  3. 通话结束时关闭两条音频 WS（Infusionalarm onClose 自动通知 Provider 停止识别）
 *  4. 释放麦克风、AudioContext、TRTC 音频帧监听
 *
 * 不负责：
 *  - HTTP 控制接口（由父组件调用 startRecording / stopRecording）
 *  - 字幕展示（由 SubtitlePanel.vue 负责）
 */

import { ref } from 'vue';

/**
 * 通过参数注入获取 TRTC 实例，避免在 Composable 内静态 import 腾讯云 SDK
 * 父组件调用 start() 时传入 getTRTCInstance 回调
 */
let _getTRTCInstance = null;

/** Float32Array PCM → Int16Array 转换 */
function float32ToInt16(float32Array) {
  const int16 = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return int16;
}

export function useSpeechRecognition() {
  // ——— 内部状态（非响应式，生命周期跟随通话） ———
  let doctorAudioWs = null;   // 医生端音频 WS
  let userAudioWs = null;     // 患者端音频 WS

  // 麦克风资源
  let mediaStream = null;
  let audioContext = null;
  let micSource = null;
  let micProcessor = null;

  // TRTC 远端音频帧资源
  let trtcInstance = null;
  let audioFrameHandler = null;

  /** 是否正在采集（响应式，供外部状态展示） */
  const isCapturing = ref(false);

  // ——— 医生端：本地麦克风采集 ———
  async function startDoctorAudio(audioWsUrl, doctorTaskId) {
    const url = `${audioWsUrl}${doctorTaskId}`;
    doctorAudioWs = new WebSocket(url);
    doctorAudioWs.binaryType = 'arraybuffer';

    doctorAudioWs.onopen = async () => {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 16000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
          },
        });
        audioContext = new AudioContext({ sampleRate: 16000 });
        micSource = audioContext.createMediaStreamSource(mediaStream);
        micProcessor = audioContext.createScriptProcessor(4096, 1, 1);

        micProcessor.onaudioprocess = (e) => {
          if (doctorAudioWs && doctorAudioWs.readyState === WebSocket.OPEN) {
            const float32 = e.inputBuffer.getChannelData(0);
            doctorAudioWs.send(float32ToInt16(float32).buffer);
          }
        };

        micSource.connect(micProcessor);
        micProcessor.connect(audioContext.destination);
        isCapturing.value = true;
      } catch (err) {
        console.error('[useSpeechRecognition] 获取麦克风失败:', err);
      }
    };

    doctorAudioWs.onclose = () => {
      // Infusionalarm onClose 自动通知 Provider 停止识别，前端无需额外处理
    };

    doctorAudioWs.onerror = (e) => {
      console.error('[useSpeechRecognition] 医生音频WS错误:', e);
    };
  }

  // ——— 患者端：TRTC 远端音频帧采集 ———
  async function startUserAudio(audioWsUrl, userTaskId) {
    const url = `${audioWsUrl}${userTaskId}`;
    userAudioWs = new WebSocket(url);
    userAudioWs.binaryType = 'arraybuffer';

    userAudioWs.onopen = async () => {
      try {
        // 通过父组件注入的回调获取 trtc-sdk-v5 实例，避免在此文件静态 import SDK
        trtcInstance = _getTRTCInstance ? _getTRTCInstance() : null;
        if (!trtcInstance) throw new Error('无法获取 TRTC 实例');

        // 启用远端音频帧事件（监听所有远端用户）
        await trtcInstance.callExperimentalAPI('enableAudioFrameEvent', {
          enable: true,
          userId: '*',
          sampleRate: 16000,
          channelCount: 1,
        });

        audioFrameHandler = (event) => {
          if (userAudioWs && userAudioWs.readyState === WebSocket.OPEN) {
            const float32 = event.data; // Float32Array
            userAudioWs.send(float32ToInt16(float32).buffer);
          }
        };

        trtcInstance.on('audio-frame', audioFrameHandler);
      } catch (err) {
        console.error('[useSpeechRecognition] 启用远端音频帧失败:', err);
      }
    };

    userAudioWs.onclose = () => {
      // 同上，Infusionalarm 自动停止识别
    };

    userAudioWs.onerror = (e) => {
      console.error('[useSpeechRecognition] 患者音频WS错误:', e);
    };
  }

  /**
   * 启动双路音频采集与推送
   * @param {string} audioWsUrl       - 例如 "ws://192.168.100.14:8089/ws/audio/"
   * @param {string} doctorTaskId     - 医生端识别任务ID
   * @param {string} userTaskId       - 患者端识别任务ID
   * @param {Function} getTRTCInstance - 返回 trtc-sdk-v5 实例的回调，由父组件传入
   */
  async function start(audioWsUrl, doctorTaskId, userTaskId, getTRTCInstance) {
    _getTRTCInstance = getTRTCInstance || null;
    await Promise.all([
      startDoctorAudio(audioWsUrl, doctorTaskId),
      startUserAudio(audioWsUrl, userTaskId),
    ]);
  }

  /**
   * 停止双路音频采集，关闭 WS（Infusionalarm 自动通知 Provider 停止识别）
   */
  async function stop() {
    isCapturing.value = false;

    // 1. 停止麦克风采集
    if (micProcessor) {
      micProcessor.onaudioprocess = null;
      micProcessor.disconnect();
      micProcessor = null;
    }
    if (micSource) {
      micSource.disconnect();
      micSource = null;
    }
    if (audioContext) {
      await audioContext.close().catch(() => {});
      audioContext = null;
    }
    if (mediaStream) {
      mediaStream.getTracks().forEach((t) => t.stop());
      mediaStream = null;
    }

    // 2. 停止远端音频帧监听
    if (trtcInstance && audioFrameHandler) {
      trtcInstance.off('audio-frame', audioFrameHandler);
      await trtcInstance
        .callExperimentalAPI('enableAudioFrameEvent', { enable: false, userId: '*' })
        .catch(() => {});
    }
    audioFrameHandler = null;
    trtcInstance = null;

    // 3. 关闭音频 WS（触发 Infusionalarm onClose → 自动停止识别）
    if (doctorAudioWs) {
      doctorAudioWs.close();
      doctorAudioWs = null;
    }
    if (userAudioWs) {
      userAudioWs.close();
      userAudioWs = null;
    }
  }

  return { start, stop, isCapturing };
}
