import request from "@/utils/request";
import downloadRequest from "@/utils/downloadRequest";
//denglu
export const getyanzhengma = (params) =>
  request.post("/medicine/getverificationcode", params);

export const getlogin = (params) =>
  request.post("/medicine/loginVerification", params);
//患者
export const getPatientlist = (params) =>
  request.post("/miduser/selectUserList", params);
export const getPatientadd = (params) =>
  request.post("/miduser/insertUser", params);
export const getPatientDetail = (params) =>
  request.post("/miduser/selectUserDetail", params);
export const getPatientdeleteUser = (params) =>
  request.post("/miduser/deleteUser", params);
export const getPatientupdateUserInfo = (params) =>
  request.post("/miduser/updateUserInfo", params);
export const getPatientselectIntroducer = (params) =>
  request.post("/acceptdropmenu/selectIntroducer", params);
export function fff(data) {
  return downloadRequest({
    url: "/miduser/exportUser",
    method: "post",
    data,
  });
}
//药库资料
export const getDrugLabel = (params) =>
  request.post("/acceptdropmenu/getDrugLabel", params);
export const getsupplier = (params) =>
  request.post("/acceptdropmenu/getsupplier", params);
export const getIntensityUnit = (params) =>
  request.post("/acceptdropmenu/getIntensityUnit", params);
export const getDrugType = (params) =>
  request.post("/acceptdropmenu/getDrugType", params);
export const getunit = (params) =>
  request.post("/acceptdropmenu/getunit", params);
export const getUsage = (params) =>
  request.post("/acceptdropmenu/getUsage", params);
export const getTimes = (params) =>
  request.post("/acceptdropmenu/getTimes", params);
export const getDays = (params) =>
  request.post("/acceptdropmenu/getDays", params);
export const getReuseRemark = (params) =>
  request.post("/acceptdropmenu/getReuseRemark", params);
export const getAdvice = (params) =>
  request.post("/acceptdropmenu/getAdvice", params);
//药库资料
export const selectMedicineList = (params) =>
  request.post("/midmedicine/selectMedicineList", params);
export const selectMedicineListadd = (params) => {
  const username = sessionStorage.getItem("username"); // 获取本地存储中的 username
  return request.post("/midmedicine/insertMedicine", params, {
    headers: {
      "X-User-Name": username,
    },
  });
};

export const selectMedicineListdel = (params) => {
  const username = sessionStorage.getItem("username");
  return request.post("/midmedicine/deleteMedicine", params, {
    headers: {
      "X-User-Name": username,
    },
  });
};

export const selectMedicineListDetail = (params) => {
  const username = sessionStorage.getItem("username");
  return request.post("/midmedicine/selectMedicineDetail", params, {
    headers: {
      "X-User-Name": username,
    },
  });
};

export const selectMedicineListup = (params) => {
  const username = sessionStorage.getItem("username");
  return request.post("/midmedicine/updateMedicine", params, {
    headers: {
      "X-User-Name": username,
    },
  });
};
// 新增药品 - multipart/form-data格式
export const insertMedicine = (formData) => {
  return request({
    url: "/midmedicine/insertMedicine",
    method: "post",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// 修改药品 - multipart/form-data格式
export const updateMedicine = (formData) => {
  return request({
    url: "/midmedicine/updateMedicine",
    method: "post",
    data: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
export function exportMedicine(data) {
  return downloadRequest({
    url: "/midmedicine/exportMedicine",
    method: "post",
    data,
  });
}
//医生资料
// export const selectDoctorList = (params) =>
//   request.post("/middoctor/selectDoctorList", params);
export const selectDoctorList = (params) =>
  request.post("/middoctor/getDoctorInfo", params);
export const selectDoctoradd = (params) =>
  request.post("/middoctor/insertDoctor", params);
export const selectDoctordel = (params) =>
  request.post("/middoctor/deleteDoctor", params);
export const selectDoctorDetaill = (params) =>
  request.post("/middoctor/selectDoctorDetail", params);
export const selectDoctorupdateDoctor = (params) =>
  request.post("/middoctor/updateDoctor", params);
export const tDoctorList = (params) =>
  request.post("/depart/midSelectDepartList", params);
export const getclinic = (params) =>
  request.post("/param/gethospitals", params);
export function exportMedicines(data) {
  return downloadRequest({
    url: "/middoctor/exportDoctor",
    method: "post",
    data,
  });
}
//入货记录
export const selectMedicineOnlyField = (params) =>
  request.post("/midmedicine/selectMedicineOnlyField", params);
export const selectMedicineLogList = (params) =>
  request.post("/midmedicinelog/selectMedicineLogList", params);
export const selectMedicineDetails = (params) =>
  request.post("/midmedicine/selectMedicineDetail", params);
export const insertMedicineLog = (params) =>
  request.post("/midmedicinelog/insertMedicineLog", params);
export function ruhuo(data) {
  return downloadRequest({
    url: "/midmedicinelog/exportMedicineLog",
    method: "post",
    data,
  });
}
//首页
export const getHome = (params) => request.post("/midhome/homeCount", params);
//药房列表
export const selectPharmacyList = (params) =>
  request.post("/acceptpharmacy/selectPharmacyList", params);
//审核
export const selectPharmacyAuditList = (params) =>
  request.post("/acceptpharmacy/selectPharmacyAuditList", params);

export const selectPharmacyQuoteList = (params) =>
  request.post("/acceptpharmacy/selectPharmacyQuote", params);
export const auditPharmacy = (params) =>
  request.post("/acceptpharmacy/auditPharmacy", params);
//远程会诊列表
export const selectMidUserOrderList = (params) =>
  request.post("/acceptmidorderuser/selectMidUserOrderList", params);
export const updateConsultation = (params) =>
  request.post("/acceptmidorderuser/updateConsultation", params);
//实名审核
export const listCertType = (params) =>
  request.post("/acceptmidorderuser/listCertType", params);
export const midDocumentVerification = (params) =>
  request.post("/acceptmidorderuser/midDocumentVerification/list", params);
export const update = (params) =>
  request.post("/acceptmidorderuser/midDocumentVerification/update", params);
export const midSelectMedicineList = (params) =>
  request.post("/midmedicine/midSelectMedicineList", params);
export const selectMedicineTypeList = (params) =>
  request.post("/midmedicine/selectMedicineTypeList", params);
export const updatefeedback = (params) =>
  request.post("/appfeedback/updatefeedback", params);
export const selectmidfeedbacklist = (params) =>
  request.post("/appfeedback/selectmidfeedbacklist", params);
export const selectUserCaseList = (params) =>
  request.post("/mini/userCase/selectUserCaseList", params);
export const choice = (params) =>
  request.post("/acceptmidorderuser/selectMid/doctor/schedule/choice", params);

export const updateMid = (params) =>
  request.post("/acceptmidorderuser/updateMid/doctor/schedule/choice", params);
export const detail = (params) =>
  request.post("/acceptmidorderuser/selectMid/doctor/order/detail", params);
export const acceptance = (params) =>
  request.post("/acceptmidorderuser/selectMid/order/acceptance", params);
export const selectprescriptiondetail = (params) =>
  request.post("/mini/acceptuserorder/selectprescriptiondetail", params);
export const receipt = (params) =>
  request.post("/acceptmidorderuser/selectMid/medicine/receipt", params);
export const attorney = (params) =>
  request.post("/acceptmidorderuser/selectMid/power/of/attorney", params);

export const updexpenditure = (params) =>
  request.post("/acceptexpenditure/updexpenditure", params);

export const insertConsultation = (params) =>
  request.post("/acceptmidorderuser/insertConsultation", params);
export const selectPharmacyAuditDetail = (params) =>
  request.post("/acceptpharmacy/selectPharmacyAuditDetail", params);
export const serviceOnlineLogin = (serviceId) => {
  return request.post(`/chat/service/online?serviceId=${serviceId}`);
};
export const serviceOffline = (serviceId) => {
  return request.post(`/chat/service/offline?serviceId=${serviceId}`);
};
export const sendChatReply = (data) => {
  return request.post("/chat/reply", data);
};
export const getChatHistory = (data) => {
  return request.post("/chat/history", data);
};
export const getChatRecords = (params) => request.post("/chat/records", params);
export const getChatRecordDetail = (params) =>
  request.post("/chat/records/detail", params);
//机构相关=============================
//查看机构
export const selectOrg = (params) =>
  request.post("/medicine/org/selectOrg", params);

//构建机构树
export const buildTree = (params) =>
  request.post("/medicine/org/buildTree", params);
//新增机构
export const addOrg = (params) => request.post("/medicine/org/addOrg", params);
//更新&&删除机构
export const updateOrg = (params) =>
  request.post("/medicine/org/updateOrg", params);

//上传机构Logo
export const uploadOrgLogo = (params) =>
  request.post("/filedec/file/orglogo", params);

export const selectDoctorTitle = (params) =>
  request.post("/middoctor/selectDoctorTitle", params);

export const selectDoctorAccount = (params) =>
  request.post("/middoctor/selectDoctorAccount", params);

export const signature = (params) =>
  request.post("/third/signature/doctor", params);
export const updonsultations = (params) =>
  request.post("/mini/updonsultations", params);

export const getuserorderList = (params) =>
  request.post("/acceptpharmacy/getuserorderList;", params);
export const presConsultation = (params) =>
  request.post("/acceptmidorderuser/presConsultation", params);
export const asadasdq = (params) =>
  request.post("/mini/updonsultations", params);
export const getfirstpreDetail = (params) =>
  request.post("/acceptpharmacy/getfirstpreDetail", params);
