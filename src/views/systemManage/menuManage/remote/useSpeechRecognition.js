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

import { ref } from "vue";

let _getTRTCInstance = null;

function float32ToInt16(float32Array) {
  const int16 = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return int16;
}

export function useSpeechRecognition() {
  let doctorAudioWs = null;
  let userAudioWs = null;

  let mediaStream = null;
  let audioContext = null;
  let micSource = null;
  let micProcessor = null;

  let trtcInstance = null;
  let audioFrameHandler = null;

  const isCapturing = ref(false);

  // ——— 医生端：本地麦克风采集 ———
  async function startDoctorAudio(audioWsUrl, doctorTaskId) {
    const url = `${audioWsUrl}${doctorTaskId}`;
    console.log("[Speech] 医生音频 WS 连接中:", url);

    return new Promise((resolve, reject) => {
      doctorAudioWs = new WebSocket(url);
      doctorAudioWs.binaryType = "arraybuffer";

      doctorAudioWs.onopen = async () => {
        console.log("[Speech] 医生音频 WS 已连接");
        try {
          console.log("[Speech] 请求麦克风权限...");
          mediaStream = await navigator.mediaDevices.getUserMedia({
            audio: {
              sampleRate: 16000,
              channelCount: 1,
              echoCancellation: true,
              noiseSuppression: true,
            },
          });
          console.log("[Speech] 麦克风权限已获取");

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
          console.log("[Speech] 医生麦克风采集已启动");
          resolve();
        } catch (err) {
          console.error("[Speech] 获取麦克风失败:", err);
          reject(err);
        }
      };

      doctorAudioWs.onclose = () => {
        console.log("[Speech] 医生音频 WS 已断开");
      };

      doctorAudioWs.onerror = (e) => {
        console.error("[Speech] 医生音频 WS 错误:", e);
        reject(new Error("医生音频 WS 连接失败"));
      };
    });
  }

  // ——— 患者端：TRTC 远端音频帧采集 ———
  async function startUserAudio(audioWsUrl, userTaskId) {
    const url = `${audioWsUrl}${userTaskId}`;
    console.log("[Speech] 患者音频 WS 连接中:", url);

    return new Promise((resolve, reject) => {
      userAudioWs = new WebSocket(url);
      userAudioWs.binaryType = "arraybuffer";

      userAudioWs.onopen = async () => {
        console.log("[Speech] 患者音频 WS 已连接");
        try {
          trtcInstance = _getTRTCInstance ? _getTRTCInstance() : null;
          console.log("[Speech] TRTC 实例获取结果:", trtcInstance ? "成功" : "失败(null)");

          if (!trtcInstance) {
            console.error("[Speech] 无法获取 TRTC 实例，患者音频采集跳过（不影响医生端采集）");
            resolve();
            return;
          }

          console.log("[Speech] 启用远端音频帧事件...");
          await trtcInstance.callExperimentalAPI("enableAudioFrameEvent", {
            enable: true,
            userId: "*",
            sampleRate: 16000,
            channelCount: 1,
          });
          console.log("[Speech] 远端音频帧事件已启用");

          audioFrameHandler = (event) => {
            if (userAudioWs && userAudioWs.readyState === WebSocket.OPEN) {
              const float32 = event.data;
              userAudioWs.send(float32ToInt16(float32).buffer);
            }
          };

          trtcInstance.on("audio-frame", audioFrameHandler);
          console.log("[Speech] 患者远端音频采集已启动");
          resolve();
        } catch (err) {
          console.error("[Speech] 启用远端音频帧失败:", err);
          resolve();
        }
      };

      userAudioWs.onclose = () => {
        console.log("[Speech] 患者音频 WS 已断开");
      };

      userAudioWs.onerror = (e) => {
        console.error("[Speech] 患者音频 WS 错误:", e);
        reject(new Error("患者音频 WS 连接失败"));
      };
    });
  }

  /**
   * 启动双路音频采集与推送
   */
  async function start(audioWsUrl, doctorTaskId, userTaskId, getTRTCInstance) {
    console.log("[Speech] ===== 启动双路音频采集 =====");
    console.log("[Speech] audioWsUrl:", audioWsUrl);
    console.log("[Speech] doctorTaskId:", doctorTaskId);
    console.log("[Speech] userTaskId:", userTaskId);
    console.log("[Speech] getTRTCInstance:", typeof getTRTCInstance);

    _getTRTCInstance = getTRTCInstance || null;

    try {
      await Promise.all([
        startDoctorAudio(audioWsUrl, doctorTaskId),
        startUserAudio(audioWsUrl, userTaskId),
      ]);
      console.log("[Speech] ===== 双路音频采集启动完成 =====");
    } catch (err) {
      console.error("[Speech] 双路音频采集启动失败:", err);
    }
  }

  /**
   * 重启患者端音频 WS
   */
  async function restartUserAudio(audioWsUrl, newUserTaskId, getTRTCInstance) {
    console.log("[Speech] 重启患者音频 WS:", newUserTaskId);
    if (userAudioWs) {
      userAudioWs.close();
      userAudioWs = null;
    }
    if (trtcInstance && audioFrameHandler) {
      trtcInstance.off("audio-frame", audioFrameHandler);
      audioFrameHandler = null;
    }
    _getTRTCInstance = getTRTCInstance || _getTRTCInstance;
    await startUserAudio(audioWsUrl, newUserTaskId);
  }

  /**
   * 停止双路音频采集，关闭 WS
   */
  async function stop() {
    console.log("[Speech] ===== 停止双路音频采集 =====");
    isCapturing.value = false;

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

    if (trtcInstance && audioFrameHandler) {
      trtcInstance.off("audio-frame", audioFrameHandler);
      await trtcInstance
        .callExperimentalAPI("enableAudioFrameEvent", {
          enable: false,
          userId: "*",
        })
        .catch(() => {});
    }
    audioFrameHandler = null;
    trtcInstance = null;

    if (doctorAudioWs) {
      doctorAudioWs.close();
      doctorAudioWs = null;
    }
    if (userAudioWs) {
      userAudioWs.close();
      userAudioWs = null;
    }
    console.log("[Speech] ===== 双路音频采集已停止 =====");
  }

  return { start, stop, restartUserAudio, isCapturing };
}
