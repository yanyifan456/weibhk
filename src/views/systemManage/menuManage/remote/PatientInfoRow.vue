<!--
  PatientInfoRow 患者基本信息行
  --------------------------------
  用于处方、会诊单等各弹窗顶部，统一展示诊所/医生/患者信息。

  Props：
    detail {Object} 详情对象，字段说明：
      - hospital      {String} 诊所名称，默认显示 "信興綜合門诊部"
      - doctorName    {String} 医生姓名
      - userName      {String} 患者姓名
      - userPatientId {String} 患者编号
      - sex           {Number} 性别，1=男，其余=女
      - age           {Number|String} 年龄
      - birthyDay     {String} 出生日期

  用法示例：
    <PatientInfoRow :detail="currentRecord" />
-->
<template>
    <a-row :gutter="[16, 8]">

        <a-col style="margin-right: 78px;margin-top: 10px;">患者姓名: {{ detail?.userName }}</a-col>
        <a-col style="margin-right: 78px;margin-top: 10px;">性别: {{ detail?.sex == 1 ? '男' : '女' }}</a-col>
        <a-col style="margin-right: 78px;margin-top: 10px;">出生日期: {{ detail?.birthyDay }}</a-col>
        <a-col style="margin-right: 78px;margin-top: 10px;">年龄: {{ detail?.age }}</a-col>
        <a-col style="margin-right: 78px;margin-top: 10px;">診療方式：互聯網視診</a-col>
        <a-col style="margin-top: 10px;">患者编号: {{ detail?.userPatientId }}</a-col>

    </a-row>
</template>

<script setup>
defineProps({
    /** 患者详情对象 */
    detail: {
        type: [Object, String],
        default: () => ({}),
    },
})
</script>
