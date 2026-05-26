<template>
    <!--
    处方单展示（样式对应 2.png）
    props:
      detail - 处方详情对象
        hospitalName / hospital - 机构名称（右上角 logo 文字）
        doctorName   - 医生姓名
        doctorTitle  - 医生职称/学位，如 "(香港大學內外全科醫學士MB BS (HK))"
        hkCertificate        - 香港西醫注册编号
        proQualifyCertificate - 中国执业证书编号
        serialNumber - 单据编号
        createTime   - 日期
        userName     - 病人姓名
        sex          - 性别
        birthyDay    - 出生日期
        age          - 年龄
        idCard       - ID no
        userPatientId - 病人编号
        houseAddress - 病人地址
        diagnosticReport - 诊断
        medicines    - 药品列表
        consultationMedicine - 会诊药方
        doctorSign   - 医生签名
        address      - 底部地址
        contactPhone - 联系电话
  -->
    <div ref="prescriptionRef"
        style="font-family: '宋体', SimSun, serif;  font-size: 13px; line-height: 1.8; background: #fff; padding: 24px 28px;">

        <!-- ===== 顶部三栏：左侧医生信息 | 中间标题 | 右上角机构 ===== -->
        <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 12px;">

            <!-- 左侧医生信息框 -->
            <div style="
        border: 1.5px solid ;
        padding: 10px 14px;
        min-width: 220px;
        max-width: 260px;
        font-size: 13px;
        line-height: 1.9;
        margin-top: 50px;
      ">
                <div style="text-align: center; font-weight: bold; margin-bottom: 4px;">醫生證書資訊</div>
                <div>
                    <span>HK Medical Council Reg</span>
                </div>
                <div>
                    No.：&nbsp;
                    <span>{{ detail.hkCertificate || '' }}</span>
                </div>
                <div style="margin-top: 4px;">
                    <span>中國執業證書編號</span>
                </div>
                <div>
                    No.：&nbsp;
                    <span>{{ detail.proQualifyCertificate || '' }}</span>
                </div>
            </div>

            <!-- 中间：医生姓名 + 学位 + 大标题 -->
            <div style="flex: 1; text-align: center; padding: 0 20px;">
                <div style="font-size: 20px; font-weight: bold; ">{{ detail.doctorName || '' }}</div>
                <div style="font-size: 13px;  margin-bottom: 10px;">({{ detail.certification || '' }})</div>
                <div style="font-size: 32px; font-weight: bold;  letter-spacing: 2px;">配药單</div>
                <div style="font-size: 22px; font-weight: bold; ">Prescription</div>
            </div>

            <!-- 右上角：机构 logo/名称 + 单据编号 + 日期 -->
            <div style="text-align: right; font-size: 13px;  min-width: 200px;">
                <!-- 机构名称（hospitalName） -->
                <img style="width: 190px;height: 40px;" :src="detail.hospitalPhoto" alt="" />
                <div style="font-size: 12px;  margin-bottom: 10px;">{{ detail.hospitalEnName || '' }}</div>
                <div style="margin-top: 8px;margin-top: 100px;">單據編號：{{ detail.formId || '' }}</div>
                <div style="margin-top: 4px;">日期：&nbsp;{{ detail.createTime ? detail.createTime.slice(0, 10) :
                    'YYYY-MM-DD' }}</div>
            </div>
        </div>

        <!-- ===== 分割线 ===== -->
        <hr style="border: none; border-top: 1.5px solid ; margin: 8px 0;" />

        <!-- ===== 患者信息行 ===== -->
        <div style="display: flex; flex-wrap: wrap; gap: 0 24px; font-size: 13px; padding: 6px 0; ">
            <span>病人姓名：{{ detail.userName || '' }}</span>
            <span>性別：{{ detail.sex == 1 ? '男' : (detail.sex == 2 ? '女' : '') }}</span>
            <span>出生日期：{{ detail.birthyDay || '' }}</span>
            <span>年齡：{{ detail.age || '' }}</span>
            <span>ID no：<span>{{ detail.idCardNo || '' }}</span></span>
            <span>病人編號：{{ detail.userPatientId || '' }}</span>
        </div>
        <div style="padding: 4px 0; font-size: 13px;">病人地址：{{ detail.houseAddress || '' }}</div>

        <hr style="border: none; border-top: 1.5px solid; margin: 8px 0;" />

        <!-- ===== 诊断 ===== -->
        <div style="margin: 10px 0 6px; font-size: 13px;">
            <span>診斷 (Diagnosis)：</span>
            <template v-if="isImageUrl(detail.consultationMedicine)">
                <img :src="detail.consultationMedicine" alt="会诊药方" style="
      max-width: 100%;
      max-height: 300px;
      object-fit: contain;
      margin-top: 8px;
      display: block;
    " />
            </template>

            <template v-else>
                <span>{{ detail.consultationMedicine || '' }}</span>
            </template>
        </div>
        <div style="margin-bottom: 14px; min-height: 32px;"></div>

        <!-- ===== 处方表格 ===== -->
        <div style="font-size: 13px; margin-bottom: 8px;">處方(Presciption):</div>
        <table style="width: 100%; border-collapse: collapse; font-size: 10px; margin-bottom: 20px;">
            <thead>
                <tr>
                    <th v-for="col in prescriptionTableHeaders" :key="col.en"
                        style="border: 1px solid ; padding: 4px 4px; text-align: center; white-space: nowrap; background: #fff;">
                        {{ col.zh }}({{ col.en }})
                    </th>
                </tr>
            </thead>
            <tbody>
                <template v-if="detail.medicines && detail.medicines.length > 0">
                    <tr v-for="(item, index) in detail.medicines" :key="index">
                        <td style="border: 1px solid ; padding: 6px; text-align: center;">{{ index + 1 }}</td>
                        <td style="border: 1px solid ; padding: 6px;">{{ item.name || '' }}</td>
                        <td style="border: 1px solid ; padding: 6px; text-align: center;">{{ item.spec || '' }}</td>
                        <td style="border: 1px solid ; padding: 6px; text-align: center;">{{ item.dosageForm || ''
                        }}</td>
                        <td style="border: 1px solid ; padding: 6px; text-align: center;">{{ item.directionsRoute ||
                            '' }}</td>
                        <td style="border: 1px solid ; padding: 6px; text-align: center;">{{ item.frenquency || ''
                        }}</td>
                        <td style="border: 1px solid ; padding: 6px; text-align: center;">{{ item.duration || '' }}
                        </td>
                        <td style="border: 1px solid ; padding: 6px; text-align: center;">{{ item.medicineCun || ''
                        }}</td>
                        <td style="border: 1px solid ; padding: 6px; text-align: center;">{{ item.specialPurpose ||
                            '' }}</td>
                    </tr>
                </template>

            </tbody>
        </table>

        <div style="min-height: 40px; margin-bottom: 16px;"></div>

        <!-- ===== 医生签名盖章 ===== -->
        <div style="text-align: right; margin-bottom: 4px; font-size: 13px;">
            <span>医生簽名：</span>

            <img :src="detail.doctorSign" style="height: 28px; width: auto; vertical-align: middle;" alt="医生签名" />
        </div>
        <div style="text-align: right; margin-bottom: 4px; font-size: 13px;">
            <span>药剂师簽名：</span>

            <img v-if="detail.pharmaSign" :src="detail.pharmaSign?.startsWith('data:image')
                ? detail.pharmaSign
                : 'data:image/png;base64,' + detail.pharmaSign"
                style="height: 68px; width: auto; vertical-align: middle;" alt="药剂师签名" />
        </div>

        <!-- ===== 插槽：操作区 ===== -->
        <slot />

        <!-- ===== 底部地址栏 ===== -->
        <hr style="border: none; border-top: 1.5px solid ; margin: 10px 0 6px;" />
        <div style="display: flex; justify-content: space-between; font-size: 12px; ">
            <div>
                <!-- 底部免责说明（可根据实际需要配置） -->
                <b> 有效期为{{ detail.effectiveStartTime }}至{{ detail.effectiveEndTime }}</b>

            </div>
            <div style="text-align: right;">
                <div>地址：{{ detail.address || '' }}</div>
                <div>TEL：{{ detail.contactPhone || '' }}</div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
    detail: { type: Object, default: () => ({}) },
});

/** 处方表格列头 */
const prescriptionTableHeaders = [
    { zh: '項目', en: 'Item' },
    { zh: '藥物名稱', en: 'Drug name' },
    { zh: '劑量', en: 'Strength' },
    { zh: '劑型', en: 'Dosage form' },
    { zh: '用法／途徑', en: 'Directions / route' },
    { zh: '頻次', en: 'Frequency' },
    { zh: '療程', en: 'Duration' },
    { zh: '數量', en: 'Quantity' },
    { zh: '特殊用法', en: 'Route of Administration' },
];

/** 保证至少显示 3 行空行 */
const emptyRows = computed(() => {
    const filled = props.detail.medicines?.length || 0;
    const min = 3;
    return Math.max(min - filled, 0);
});

const isImageUrl = (url) => {
    if (!url) return false;
    return url.startsWith('http') && /\.(png|jpg|jpeg|gif|webp)$/i.test(url);
};
</script>
