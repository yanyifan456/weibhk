<template>
    <!--
    建議單头部：样式对应 1.png
    props:
      doctorName     - 接诊医生姓名
      hkCertificate  - 香港西医注册编号（HK Medical Council Reg No）
      proQualifyCertificate - 中国执业证书编号（Physician's Qualification Certificate No）
      practiceSite   - 中国内地执业地点
      hospitalName   - 机构名称（右上角 / 中间标题）
      subHospitalName - 副标题（如"信興綜合門診部互聯網醫院"）
      serialNumber   - 单据编号
      createTime     - 创建时间
  -->
    <div style="font-family: '宋体', SimSun, serif; position: relative;">
        <!-- 顶部三栏布局：左侧医生信息 | 中间标题 | 右上角单据信息 -->
        <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 8px;">

            <!-- 左侧：医生信息框 -->
            <div style="
        border: 1.5px solid #555;
        padding: 10px 14px;
        min-width: 400px;
        max-width: 260px;
        font-size: 13px;
        line-height: 1.9;
        color: #222;
      ">
                <div style="text-align: center; font-weight: bold;  margin-bottom: 4px;">醫生信息</div>
                <div>接診醫生：{{ doctorName || '' }}</div>
                <div>
                    <span>香港西醫注冊編號</span>
                    HK Medical Council Reg
                </div>
                <div>
                    No.：&nbsp;
                    <span>{{ hkCertificate || '' }}</span>
                </div>
                <div style="margin-top: 4px;">
                    <span>中國執業證書編號</span>
                    Physician's Qualification Certificate
                </div>
                <div>
                    No.：&nbsp;
                    <span>{{ proQualifyCertificate || '' }}</span>
                </div>
                <div style="margin-top: 4px;">中國內地執業地點：{{ hospital || '' }}</div>
            </div>

            <!-- 中间：机构名称 + 标题 -->
            <div style="flex: 1; text-align: center; padding: 0 20px;margin-right: 200px;">
                <div style="font-size: 22px; font-weight: bold;  margin-bottom: 4px;">
                    廣州南沙信興互聯網醫院有限公司
                </div>
                <div style="font-size: 16px; font-weight: bold;  margin-bottom: 10px;">
                    {{ subHospitalName || '信興綜合門診部互联网医院' }}
                </div>
                <div style="font-size: 30px; font-weight: bold;  letter-spacing: 4px;">醫療建議書</div>
            </div>

            <!-- 右上角：单据编号 + 日期 -->
            <div style="text-align: right; font-size: 13px;  min-width: 160px; white-space: nowrap;margin-top: 200px;">
                <div>單據編號：{{ formId || '' }}</div>
                <div style="margin-top: 4px;">&nbsp;日期：{{ createTime || 'YYYY-MM-DD' }}</div>
            </div>
        </div>
    </div>
</template>

<script setup>
defineProps({
    doctorName: { type: String, default: '' },
    hkCertificate: { type: String, default: '' },
    proQualifyCertificate: { type: String, default: '' },
    practiceSite: { type: String, default: '' },
    hospitalName: { type: String, default: '' },
    subHospitalName: { type: String, default: '' },
    formId: { type: String, default: '' },
    createTime: { type: String, default: '' },
    hospital: { type: String, default: '' },
});
</script>
