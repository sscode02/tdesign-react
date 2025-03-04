import React, { useState, useMemo } from 'react';
import { Table, Input, Select, DatePicker, MessagePlugin } from 'tdesign-react';
import dayjs from 'dayjs';

const FRAMEWORK_OPTIONS = [
  { label: 'Vue Framework', value: 'Vue' },
  { label: 'React Framework', value: 'React' },
  { label: 'Miniprogram Framework', value: 'Miniprogram' },
  { label: 'Flutter Framework', value: 'Flutter' },
];

export default function EditableCellTable() {
  const initData = new Array(5).fill(null).map((_, i) => ({
    key: String(i + 1),
    firstName: ['Eric', 'Gilberta', 'Heriberto', 'Lazarus', 'Zandra'][i % 4],
    framework: ['Vue', 'React', 'Miniprogram', 'Flutter'][i % 4],
    email: [
      'espinke0@apache.org',
      'gpurves1@issuu.com',
      'hkment2@nsw.gov.au',
      'lskures3@apache.org',
      'zcroson5@virginia.edu',
    ][i % 4],
    letters: [['A'], ['B', 'E'], ['C'], ['D', 'G', 'H']][i % 4],
    createTime: ['2021-11-01', '2021-12-01', '2022-01-01', '2022-02-01', '2022-03-01'][i % 4],
  }));

  const [data, setData] = useState([...initData]);
  const [relationSelect, setRelationSelect] = useState({});

  const editableCellState = (cellParams) => {
    // 第一行不允许编辑
    return cellParams.rowIndex !== 0;
  };

  const columns = useMemo(
    () => [
      {
        title: 'FirstName',
        colKey: 'firstName',
        align: 'left',
        // 编辑状态相关配置，全部集中在 edit
        edit: {
          // 1. 支持任意组件。需保证组件包含 `value` 和 `onChange` 两个属性，且 onChange 的第一个参数值为 new value。
          // 2. 如果希望支持校验，组件还需包含 `status` 和 `tips` 属性。具体 API 含义参考 Input 组件
          component: Input,
          // props, 透传全部属性到 Input 组件
          props: {
            clearable: true,
            autofocus: true,
          },
          // 除了点击非自身元素退出编辑态之外，还有哪些事件退出编辑态
          abortEditOnEvent: ['onEnter'],
          // 编辑完成，退出编辑态后触发
          onEdited: (context) => {
            data.splice(context.rowIndex, 1, context.newRowData);
            setData([...data]);
            console.log('Edit firstName:', context);
            MessagePlugin.success('Success');
          },
          // 校验规则，此处同 Form 表单
          rules: [
            { required: true, message: '不能为空' },
            { max: 10, message: '字符数量不能超过 10', type: 'warning' },
          ],
        },
        // 默认是否为编辑状态
        defaultEditable: true,
      },
      {
        title: 'Framework',
        colKey: 'framework',
        cell: ({ row }) => FRAMEWORK_OPTIONS.find((t) => t.value === row.framework)?.label,
        edit: {
          component: Select,
          // props, 透传全部属性到 Select 组件
          props: {
            clearable: true,
            options: FRAMEWORK_OPTIONS,
          },
          // 除了点击非自身元素退出编辑态之外，还有哪些事件退出编辑态
          abortEditOnEvent: ['onChange'],
          // 编辑完成，退出编辑态后触发
          onEdited: (context) => {
            data.splice(context.rowIndex, 1, context.newRowData);
            setData([...data]);
            console.log('Edit Framework:', context);
            MessagePlugin.success('Success');
            // 记录编辑结果
            const { newRowData } = context;
            setRelationSelect({
              ...relationSelect,
              [newRowData.key]: newRowData.framework,
            });
          },
        },
      },
      {
        title: 'Letters',
        colKey: 'letters',
        cell: ({ row }) => row?.letters?.join('、'),
        edit: {
          component: Select,
          // props, 透传全部属性到 Select 组件
          // props 为函数时，参数有：col, row, rowIndex, colIndex, editedRow。一般用于实现编辑组件之间的联动
          props: ({ editedRow }) => ({
            multiple: true,
            minCollapsedNum: 1,
            options: [
              { label: 'A', value: 'A' },
              { label: 'B', value: 'B' },
              { label: 'C', value: 'C' },
              { label: 'D', value: 'D' },
              { label: 'E', value: 'E' },
              // 如果框架选择了 React，则 Letters 隐藏 G 和 H
              { label: 'G', value: 'G', show: () => editedRow.framework !== 'React' },
              { label: 'H', value: 'H', show: () => editedRow.framework !== 'React' },
            ].filter(t => (t.show === undefined ? true : t.show())),
          }),
          // abortEditOnEvent: ['onChange'],
          onEdited: (context) => {
            data.splice(context.rowIndex, 1, context.newRowData);
            setData([...data]);
            console.log('Edit Letters:', context);
            MessagePlugin.success('Success');
          },
        },
      },
      {
        title: 'Date',
        colKey: 'createTime',
        // props, 透传全部属性到 DatePicker 组件
        edit: {
          component: DatePicker,
          props: {
            mode: 'date',
          },
          // 除了点击非自身元素退出编辑态之外，还有哪些事件退出编辑态
          abortEditOnEvent: ['onChange'],
          onEdited: (context) => {
            data.splice(context.rowIndex, 1, context.newRowData);
            setData([...data]);
            console.log('Edit Date:', context);
            MessagePlugin.success('Success');
          },
          // 校验规则，此处同 Form 表单
          rules: () => [
            {
              validator: (val) => dayjs(val).isAfter(dayjs()),
              message: '只能选择今天以后日期',
            },
          ],
        },
      },
    ],
    [data, relationSelect],
  );

  // 当前示例包含：输入框、单选、多选、日期 等场景
  return <Table rowKey="key" columns={columns} data={data} editableCellState={editableCellState} bordered />;
}
