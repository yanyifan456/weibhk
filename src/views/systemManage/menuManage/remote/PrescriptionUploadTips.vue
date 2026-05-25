<!--
  PrescriptionUploadTips 处方图片上传注意事项
  --------------------------------------------
  在所有涉及处方图片上传的区域统一展示红色提示文字，
  无需传入任何 props，直接引入即可使用。

  用法示例：
    <PrescriptionUploadTips />
-->
<template>
    <div style="color: red; font-size: 13px; line-height: 1.8;">
        <div>1. 处方内容须书写准确、完整，不得出现与诊疗无关的信息。</div>
        <div>2. 开具处方的医师必须亲笔签名。</div>
        <div>3. 拍摄处方时，应在光线充足的环境下进行，确保图像清晰、无遮挡。</div>
    </div>
</template>
