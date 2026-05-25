import { TUICallKitAPI } from "@trtc/calls-uikit-vue";

export async function initTuiCall(userID, SDKAppID, SecretKey) {
  try {
    // 生成 userSig
    const { genTestUserSig } = await import("@/debug/GenerateTestUserSig-es");
    const { userSig } = genTestUserSig({
      userID,
      SDKAppID,
      SecretKey,
    });

    // 登录 TUICallKit
    await TUICallKitAPI.init({
      userID,
      userSig,
      SDKAppID,
    });

    console.log("TUICall 登录成功");
    return true;
  } catch (e) {
    console.error("TUICall 登录失败：", e);
    return false;
  }
}

export async function setSelfInfo(nickName, avatar) {
  try {
    await TUICallKitAPI.setSelfInfo({ nickName, avatar });
  } catch (e) {
    console.error("设置昵称/头像失败：", e);
  }
}

export async function callUser(userID, type = "VIDEO") {
  try {
    await TUICallKitAPI.calls({
      userIDList: [userID],
      type,
    });
  } catch (e) {
    console.error("发起通话失败：", e);
  }
}
