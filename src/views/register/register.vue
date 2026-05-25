<template>
  <div>
    <span> caller's ID: </span>
    <input type="text" v-model="callerUserID" />
    <button @click="init">step1. init</button> <br />
    <span> callee's ID: </span>
    <input type="text" v-model="calleeUserID" />
    <button @click="call">step2. call</button>
    <button @click="init2">step1. init2</button> <br />

    <div class="triangle"></div>

    <!--【1】Import the TUICallKit component: Call interface UI -->
    <TUICallKit style="width: 650px; height: 500px" />
  </div>
</template>
<script setup>
import { ref } from "vue";
import { TUICallKit, TUICallKitAPI, CallMediaType } from "@trtc/calls-uikit-vue";
import * as GenerateTestUserSig from "../../debug/GenerateTestUserSig-es"; // Refer to Step 3

const callerUserID = ref("test1");
const calleeUserID = ref("15353035914");

//【2】Initialize the TUICallKit component
const init = async () => {
  const { userSig } = GenerateTestUserSig.genTestUserSig({
    userID: callerUserID.value,
  });
  await TUICallKitAPI.init({
    userID: callerUserID.value,
    userSig,
    SDKAppID,
    // tim: this.tim     // 如果工程中已有 tim 实例，需在此处传入
  });
  alert("TUICallKit init succeed");
};
const init2 = async () => {
  const { userSig } = GenerateTestUserSig.genTestUserSig({
    userID: calleeUserID.value,
    SDKAppID,
    SecretKey: SecretKey,
  });
  await TUICallKitAPI.init({
    userID: calleeUserID.value,
    userSig,
    SDKAppID,
    // tim: this.tim     // 如果工程中已有 tim 实例，需在此处传入
  });
  alert("TUICallKit init succeed");
};

//【3】Make a 1v1 video call
const call = async () => {
  await TUICallKitAPI.calls({
    userIDList: [calleeUserID.value],
    type: CallMediaType.VIDEO,
  });
};
</script>
<style lang="scss" scoped>
.triangle {
  width: 0;
  height: 0;
  border: none;
  clip-path: polygon(50% 0, 0 100%, 100% 100%);
  background: red;
}
</style>
