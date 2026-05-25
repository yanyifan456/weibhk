import request from "@/utils/request";
import downloadRequest from "@/utils/downloadRequest";

/**
 * 查询角色列表
 * @param {*} params
 */
export const getRoleList = (params) => request.post("/right/getroleinfos", params);

/**
 * 查询用户列表
 * @param {*} params
 * @param {String} params.roleType 角色类型
 * @param {String} params.telphone 手机号
 * @param {String} params.loginName 用户名
 */
export const getUserList = (params) => request.post("/medicine/getloginUserinfo", params);

/**
 * 获取验证码
 * @param {*} params
 * @param {String} params.telPhone 验证码
 */
export const getCode = (params) => request.post("/medicine/getverifyUserCode", params);

/**
 * 更新用户信息状态
 * @param {*} params
 * @param {String} params.status 用户id
 * @param {String} params.loginName 用户名
 * @param {String} params.code 验证码
 */
export const updateUserStatus = (params) => request.post("/medicine/loginUserUpd", params);

/**
 * 更新用户角色
 * @param {*} params
 * @param {String} params.roleId 角色ID
 * @param {String} params.loginName 用户名
 * @param {String} params.code 验证码
 */
export const updateUserRole = (params) => request.post("/medicine/loginUserUpd", params);

/**
 * 更新用户密码
 * @param {*} params
 * @param {String} params.passWord 用户id
 * @param {String} params.loginName 用户名
 * @param {String} params.code 验证码
 */
export const updateUserPwd = (params) => request.post("/medicine/loginUserUpd", params);

/**
 * 新增用户
 * @param {*} params
 * @param {String} params.passWord 用户id
 * @param {String} params.loginName 用户名
 * @param {String} params.code 验证码
 */
export const addUser = (params) => request.post("/medicine/loginuseradd", params);
/**
 * 获取医院列表
 * @param {*} params
 */
export const getHospital = (params) => request.post("/param/gethospitals", params);

/**
 * 下拉菜单获取仓库资料中的单位
 * @param {Object} params
 */
export const getUnit = (params) => request.post("/acceptdropmenu/getunit", params);

/**
 * 获取供应商
 * @param {Object} params
 */
export const getSupplier = (params) => request.post("/acceptdropmenu/getsupplier", params);

/**
 * 获取支付放式
 * @param {Object} params
 */
export const getPaymentMode = (params) => request.post("/acceptdropmenu/getpaytype", params);

/**
 * 获取入货记录的单位
 * @param {Object} params
 */
export const getWarehouseUnit = (params) => request.post("/acceptdropmenu/getunitforin", params);

/**
 * 查询仓库资料
 * @param {Object} params
 * @param {String} params.materialName 物料名称
 * @param {String} params.activate 物料状态
 * @param {String} params.createTime 日期时间
 */
export const getWarehouseInfo = (params) => request.post("/acceptwarehouse/warehouseList", params);

/**
 * 新增仓库资料
 * @param {Object} params - 仓库资料参数
 * @param {String} params.materialName 物料名称
 * @param {Number} params.unitPrice 单位售价
 * @param {String} params.supplier 供应商
 * @param {String} params.unit 单位
 * @param {String|Date} params.validDate 有效期
 * @param {Number} params.reorderLevel 订货水平
 * @param {String} params.rsvInfo 备注
 * @param {Number} params.activate 启用状态（0-禁用；1-启用）
 * @returns {Promise} 请求结果
 */
export const addWarehouseInfo = (params) => request.post("/acceptwarehouse/addwarehouse", params);

/**
 * 修改仓库资料
 * @param {Object} params
 * @param {String} params.id 仓库ID
 * @param {String} params.materialName 物料名称
 * @param {String} params.activate 物料状态
 * @param {String} params.createTime 日期时间
 * @param {String} params.unit 单位
 * @param {String} params.supplier 供应商
 * @param {String} params.price 价格
 */
export const updateWarehouseInfo = (params) => request.post("/acceptwarehouse/updwarehouse", params);

/**
 * 删除仓库资料
 * @param {Object} params
 * @param {String} params.id 仓库ID
 */
export const deleteWarehouseInfo = (params) => request.post("/acceptwarehouse/delwarehouse", params);

/**
 * 无分页版本仓库资料
 */
export const getWarehouseInfoNoPage = (params) => request.post("/acceptwarehouse/warehouseListNoPage", params);

/**
 * 查询入货记录
 * @param {Object} params
 * @param {String} params.materialName 物料名称
 * @param {String} params.createTime 日期
 */
export const getInRecord = (params) => request.post("/acceptinandout/queryIn", params);
/**
 * 获取入货记录的单位
 */
export const getInRecordUnit = (params) => request.post("/acceptdropmenu/getunitforin", params);

/**
 * 新增入货记录（Purchase Record）
 * @param {Object} params
 * @param {String} params.materialName 物料名称
 * @param {String} params.createTime 创建时间（格式：YYYY-MM-DD）
 * @param {String} params.code 运单编码
 * @param {String} params.supplier 供应商
 * @param {Number|String} params.reorderLevel 订购数量
 * @param {String} params.unit 单位
 * @param {String} params.validDate 有效期（格式：YYYY-MM-DD）
 * @param {Number|String} params.totalCost 总成本
 * @param {String} params.rsvInfo 备注
 */
export const addInRecord = (params) => request.post("/acceptinandout/addIn", params);

/**
 *  获取出货记录中的类型
 */
export const getOutRecordType = (params) => request.post("/acceptdropmenu/getrecordtype", params);

/**
 * 新增出货记录
 *
 * @param {Object} params
 * @param {string} params.materialName 物料名称
 * @param {string} params.createTime 日期
 * @param {string} params.unit 单位
 * @param {'1'|'2'|'3'} params.type 类型 1-转送 2-损坏 3-正常
 * @param {string} params.giver 转送到（仅 type=1 时使用）
 * @param {number} params.shipNumber 数量
 * @param {string} [params.rsvInfo] 备注
 * @returns {Promise<any>}
 */
export const addOutRecord = (params) => request.post("/acceptinandout/addOut", params);

/**
 * 查询出货记录
 * @param {Object} params
 * @param {String} params.materialName 物料名称
 * @param {String} params.createTime 日期
 * @param {String} params.type 类型
 */
export const getOutRecord = (params) => request.post("/acceptinandout/queryOut", params);

/**
 * 查询运营数据
 * @param {Object} params
 * @param {String} params.date 日期
 */
export const getOperationData = (params) => request.post("/acceptoperation/dailydata", params);

/**
 * 获取药品下拉列表
 * @param {Object} params
 */
export const getDrugList = (params) => request.post("/midmedicine/selectMedicineOnlyField", params);

/**
 * 开出药物的查询
 * @param {Object} params
 * @param {String} params.createTime 日期
 * @param {String} params.name  药品名称
 */
export const getDrugOut = (params) => request.post("/acceptoperation/selectprescribe", params);

/**
 * 查询支出账单
 * @param {Object} params
 * @param {String} params.tradeTime 日期
 */
export const getExpenseBill = (params) => request.post("/acceptexpenditure/getexpenditure", params);

/**
 * 新增支出账单
 * @param {Object} params
 * @param {String} params.tradeTime   支付时间
 * @param {String} params.tradeClass  种类
 * @param {String} params.tradeStaff  收款人
 * @param {String} params.payType     支付类型
 * @param {Number} params.paidFee     数值
 * @param {String} params.rsrvInfo    备注
 */
export const addExpenseBill = (params) => request.post("/acceptexpenditure/addexpenditure", params);

/**
 * 删除支出/应付账单
 * @param {Object} params
 * @param {String} params.tradeId  账单ID
 */
export const deleteExpenseBill = (params) => request.post("/acceptexpenditure/delexpenditure", params);

/**
 * 查询应付帐单
 * @param {Object} params
 * @param {String} params.inputDate 日期
 */
export const getPayableBill = (params) => request.post("/acceptexpenditure/getaccountpay", params);

/**
 * 新增应付账单
 * @param {Object} params
 * @param {String} params.inputDate   输入日期
 * @param {String} params.payTime     成交日期
 * @param {String} params.tradeClass  种类
 * @param {String} params.tradeStaff  收款人
 * @param {String} params.payType     支付类型
 * @param {Number} params.unpaidFee   数值
 * @param {String} params.rsrvInfo    备注
 */
export const addPayableBill = (params) => request.post("/acceptexpenditure/addaccountpay", params);

/**
 * 获取路由映射表
 * @param {Object} params
 * @param {String} params.roleId 角色ID
 */
export const getRouteMap = (params) => request.post("/param/getrolemenuship", params);

/**
 * 导出仓库资料
 * @param {Object} params
 * @param {String} params.materialName 物料名称
 * @param {String} params.activate  是否激活
 *
 */
export const exportWarehouseInfo = (params) => downloadRequest.post("/acceptwarehouse/exportwarehouse", params);

/**
 * 导出入货记录
 * @param {String} params.materialName 物料名称
 * @param {String} params.createTime 日期
 */
export const exportInRecord = (params) => downloadRequest.post("/acceptwarehouse/exportpurchaserecords", params);

/**
 * 导出出货记录
 * @param {String} params.materialName 物料名称
 * @param {String} params.createTime 日期
 * @param {String} params.type 类型
 */
export const exportOutRecord = (params) => downloadRequest.post("/acceptwarehouse/exportsellrecords", params);

/**
 * 打印运营数据
 * @param {Object} params
 * @param {String} params.date 日期
 */
export const printOperationData = (params) => downloadRequest.post("/acceptoperation/exportdailydata", params);

/**
 * 交易详情的查询与打印
 * @param {Object} params
 * @param {String} params.startTime 日期
 * @param {String} params.endTime 类别
 */
export const printTradeDetail = (params) => downloadRequest.post("/acceptoperation/exporttradedetail", params);

/**
 * 打印开出药物
 * @param {Object} params
 * @param {String} params.createTime 日期
 * @param {String} params.name 类别
 */
export const printDrugOut = (params) => downloadRequest.post("/acceptoperation/exportprescribe", params);

/**
 * 获取会诊记录详情
 * @param {Object} params
 * @param {String} params.consultationId 会诊ID
 */
export const getConsultationDetail = (params) => request.post("/acceptmidorderuser/getConsultationDetail", params);

/**
 * 添加会诊记录
 * @param {Object} params
 * @param {String} params.orderId 订单ID
 * @param {String} params.doctorId 医生ID
 * @param {String} params.diagnosticResult 诊断结果
 * @param {String} params.consultationMedicine 会诊用药
 * @param {String} params.userId 用户ID
 * @param {String} params.pharmacistId 药师ID
 */
export const insertConsultation = (params) => request.post("/acceptmidorderuser/insertConsultation", params);

/**
 * 修改会诊记录
 * @param {Object} params
 * @param {String} params.consultationId 会诊ID
 * @param {String} params.diagnosticResult 诊断结果
 * @param {String} params.consultationMedicine 处方
 */
export const updateConsultation = (params) => request.post("/acceptmidorderuser/updateConsultation", params);

/**
 * 获取区号列表
 * @param {Object} params
 * @param {String} params.consultationId 会诊ID
 * @param {String} params.diagnosticResult 诊断结果
 * @param {String} params.consultationMedicine 处方
 */
export const getCountryList = (params) => request.post("/country/code/select/countryList", params);

/**
 * 获取病历审核列表
 * @param {Object} params
 * @param {String} params.orderId 单号
 * @param {String} params.createTime 创建时间
 * @param {String} params.loginName 用户名
 单号
 */
export const getRecordList = (params) => request.post("/acceptmidorderuser/getMidUserOrderinfo", params);
/**
 * 获取病历审核列表
 * @param {Object} params
 * @param {String} params.orderId 单号
 * @param {String} params.createTime 创建时间
 * @param {String} params.loginName 用户名
 单号
 */
export const checkRecord = (params) => request.post("/acceptmidorderuser/userOrdercheck", params);
/**
 * 药单报价
 * @param {Object} params
 * @param {String} params.consultationId 处方单号
 * @param {String} params.medicines 药品列表
 * @param {String} params.tradeFee 总价
 单号
 */
export const qoute = (params) => request.post("/acceptpharmacy/fillPharmacyPrice", params);

/**
 * 文件解密
 */
export const decryptFile = (params) => request.post("/filedec/desfile/download", params);

/**
 * 获取机构数
 */
export const buildTree = (params) => request.post("/param/getsysdepttree", params);
