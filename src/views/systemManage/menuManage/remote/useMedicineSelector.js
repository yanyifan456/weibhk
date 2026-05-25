/**
 * useMedicineSelector
 * -----------------------------------------------
 * 封装「药品搜索 + 分页 + 勾选 + 额外字段 + 手动新增」的完整逻辑。
 * 在「会诊弹窗」和「修改建议单弹窗」中各自实例化，互不干扰。
 *
 * 返回：
 *   searchForm         - 搜索表单 { type, name, current, pageSize }
 *   medicineList       - 当前页药品列表
 *   medicinePagination - 分页配置
 *   selectedIds        - 已选药品 ID 数组
 *   quantities         - 各药品数量 { [id]: number }
 *   extraFields        - 各药品额外字段 { [id]: { dosageForm, frenquency, duration, directionsRoute, specialPurpose } }
 *   manualMedicines    - 手动新增药品列表
 *   fetchList          - 请求药品列表
 *   handleSearch       - 重置分页并搜索
 *   handleTableChange  - 分页切换
 *   toggleSelectAll    - 全选/取消全选
 *   toggleSelect       - 单个勾选
 *   addManual          - 新增手动药品
 *   removeManual       - 删除手动药品
 *   reset              - 重置全部状态（关闭弹窗时调用）
 *   prefillFromDetail  - 回显已有会诊数据（打开弹窗时调用）
 */
import { ref, reactive } from "vue";
import { midSelectMedicineList } from "@/api/yyf";

let _manualKey = 0; // 手动药品唯一 key 计数器（模块级，每次 addManual 自增）

export function useMedicineSelector() {
  // ===== 搜索表单 =====
  const searchForm = reactive({
    type: undefined,
    name: "",
    current: 1,
    pageSize: 10,
  });

  // ===== 药品列表 + 分页 =====
  const medicineList = ref([]);
  const medicineTotal = ref(0);
  const medicinePagination = reactive({
    current: 1,
    pageSize: 10,
    total: 0,
    showSizeChanger: true,
    showQuickJumper: true,
    showTotal: (total) => `共 ${total} 条`,
    size: "small",
  });

  // ===== 勾选状态 =====
  const selectedIds = ref([]); // 已选药品 ID
  const quantities = reactive({}); // { [id]: number }
  const extraFields = reactive({}); // { [id]: { dosageForm, frenquency, duration, directionsRoute, specialPurpose } }

  // ===== 手动新增药品 =====
  const manualMedicines = ref([]);

  // -----------------------------------------------
  // 内部：确保 extraFields 中存在某 id 的记录
  // -----------------------------------------------
  const _ensureExtra = (id) => {
    if (!extraFields[id]) {
      extraFields[id] = {
        dosageForm: "",
        frenquency: "",
        duration: "",
        directionsRoute: "",
        specialPurpose: "",
      };
    }
  };

  // -----------------------------------------------
  // 请求药品列表
  // -----------------------------------------------
  const fetchList = async () => {
    try {
      const res = await midSelectMedicineList({
        current: String(searchForm.current),
        pageSize: String(searchForm.pageSize),
        name: searchForm.name || "",
        type: searchForm.type || "",
      });
      if (res.code == 200) {
        medicineList.value = res.data.data || [];
        medicineTotal.value = res.data.total || 0;
        medicinePagination.total = medicineTotal.value;
        medicinePagination.current = searchForm.current;
      }
    } catch (error) {
      console.error("[useMedicineSelector] 获取药品列表失败:", error);
    }
  };

  // -----------------------------------------------
  // 搜索（重置分页到第 1 页）
  // -----------------------------------------------
  const handleSearch = () => {
    searchForm.current = 1;
    medicinePagination.current = 1;
    fetchList();
  };

  // -----------------------------------------------
  // 分页切换
  // -----------------------------------------------
  const handleTableChange = (pgn) => {
    searchForm.current = pgn.current;
    searchForm.pageSize = pgn.pageSize;
    medicinePagination.current = pgn.current;
    medicinePagination.pageSize = pgn.pageSize;
    fetchList();
  };

  // -----------------------------------------------
  // 全选 / 取消全选
  // -----------------------------------------------
  const toggleSelectAll = (e) => {
    const checked = e.target.checked;
    if (checked) {
      medicineList.value.forEach((item) => {
        if (!selectedIds.value.includes(item.id)) {
          selectedIds.value.push(item.id);
          _ensureExtra(item.id);
        }
      });
    } else {
      medicineList.value.forEach((item) => {
        const idx = selectedIds.value.indexOf(item.id);
        if (idx > -1) selectedIds.value.splice(idx, 1);
      });
    }
  };

  // -----------------------------------------------
  // 单个勾选 / 取消勾选
  // -----------------------------------------------
  const toggleSelect = (id) => {
    const idx = selectedIds.value.indexOf(id);
    if (idx > -1) {
      selectedIds.value.splice(idx, 1);
    } else {
      selectedIds.value.push(id);
      _ensureExtra(id);
    }
  };

  // -----------------------------------------------
  // 手动新增药品
  // -----------------------------------------------
  const addManual = () => {
    manualMedicines.value.push({
      _key: ++_manualKey,
      name: "",
      spec: "",
      clazz: "",
      medicineCun: 1,
      dosageForm: "",
      frenquency: "",
      duration: "",
      directionsRoute: "",
      specialPurpose: "",
    });
  };

  // -----------------------------------------------
  // 删除手动药品
  // -----------------------------------------------
  const removeManual = (index) => {
    manualMedicines.value.splice(index, 1);
  };

  // -----------------------------------------------
  // 重置全部状态（弹窗关闭时调用）
  // -----------------------------------------------
  const reset = () => {
    searchForm.type = undefined;
    searchForm.name = "";
    searchForm.current = 1;
    medicinePagination.current = 1;
    selectedIds.value = [];
    medicineList.value = [];
    Object.keys(quantities).forEach((k) => delete quantities[k]);
    Object.keys(extraFields).forEach((k) => delete extraFields[k]);
    manualMedicines.value = [];
  };

  // -----------------------------------------------
  // 回显已有会诊数据（弹窗打开时调用）
  // existingMeds: 接口返回的已有药品数组
  // -----------------------------------------------
  const prefillFromDetail = async (existingMeds = []) => {
    // 先加载第一页药品列表
    const firstRes = await midSelectMedicineList({
      current: "1",
      pageSize: String(searchForm.pageSize),
      name: "",
      type: "",
    });

    let baseList = [];
    let baseTotal = 0;
    if (firstRes.code == 200) {
      baseList = firstRes.data.data || [];
      baseTotal = firstRes.data.total || 0;
    }

    // 将历史药品中不在 baseList 里的追加进去，保证回显时能在列表中找到
    existingMeds.forEach((med) => {
      const id = med.medicineId || med.id;
      if (id && !baseList.find((m) => m.id === id)) {
        baseList = [
          {
            id,
            name: med.name || "",
            spec: med.spec || "",
            clazz: med.clazz || "",
          },
          ...baseList,
        ];
      }
    });

    medicineList.value = baseList;
    medicineTotal.value = baseTotal;
    medicinePagination.total = baseTotal;
    medicinePagination.current = 1;
    searchForm.current = 1;

    // 区分接口药品（有 medicineId/id）和手动新增药品（无 medicineId）
    existingMeds.forEach((med) => {
      const id = med.medicineId || med.id;
      if (id) {
        // 接口药品：回填勾选、数量、额外字段
        if (!selectedIds.value.includes(id)) selectedIds.value.push(id);
        quantities[id] = med.medicineCun || 1;
        extraFields[id] = {
          dosageForm: med.dosageForm || "",
          frenquency: med.frenquency || "",
          duration: med.duration || "",
          directionsRoute: med.directionsRoute || "",
          specialPurpose: med.specialPurpose || "",
        };
      } else {
        // 手动新增药品：直接追加到 manualMedicines
        manualMedicines.value.push({
          _key: ++_manualKey,
          name: med.name || "",
          spec: med.spec || "",
          clazz: med.clazz || "",
          medicineCun: med.medicineCun || 1,
          dosageForm: med.dosageForm || "",
          frenquency: med.frenquency || "",
          duration: med.duration || "",
          directionsRoute: med.directionsRoute || "",
          specialPurpose: med.specialPurpose || "",
        });
      }
    });
  };

  // -----------------------------------------------
  // 构建提交用的 medicines 数组
  // 返回 [...接口药品, ...手动新增药品]
  // -----------------------------------------------
  const buildMedicines = () => {
    const apiItems = selectedIds.value.map((id) => {
      const item = medicineList.value.find((m) => m.id === id);
      const extra = extraFields[id] || {};
      return {
        medicineId: id,
        name: item ? item.name : "",
        spec: item ? item.spec || "" : "",
        medicineCun: quantities[id] || 1,
        dosageForm: extra.dosageForm || "",
        frenquency: extra.frenquency || "",
        duration: extra.duration || "",
        directionsRoute: extra.directionsRoute || "",
        specialPurpose: extra.specialPurpose || "",
      };
    });

    const manualItems = manualMedicines.value.map((item) => ({
      medicineId: null,
      name: item.name || "",
      spec: item.spec || "",
      clazz: item.clazz || "",
      medicineCun: item.medicineCun || 1,
      dosageForm: item.dosageForm || "",
      frenquency: item.frenquency || "",
      duration: item.duration || "",
      directionsRoute: item.directionsRoute || "",
      specialPurpose: item.specialPurpose || "",
    }));

    return [...apiItems, ...manualItems];
  };

  return {
    // 状态
    searchForm,
    medicineList,
    medicinePagination,
    selectedIds,
    quantities,
    extraFields,
    manualMedicines,
    // 方法
    fetchList,
    handleSearch,
    handleTableChange,
    toggleSelectAll,
    toggleSelect,
    addManual,
    removeManual,
    reset,
    prefillFromDetail,
    buildMedicines,
  };
}
