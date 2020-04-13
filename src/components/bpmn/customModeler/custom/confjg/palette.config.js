
const flowAction = { // 线
    type: 'global-connect-tool',
    action: ['bpmn:SequenceFlow', 'tools', 'bpmn-icon-connection-multi', '连接线']
}
const customShapeAction = [ // shape
    {
        type: 'create.start-event',
        action: ['bpmn:StartEvent', 'event', 'icon-custom icon-custom-start', '开始节点']
    },
    {
        type: 'create.task',
        action: ['bpmn:Task', 'activity', 'icon-custom-task-none', '普通任务']
    },
    {
        type: 'create.change-task',
        action: ['bpmn:Task', 'activity', 'icon-custom-task-change palette-title', '转填任务']
    },
    {
        type: 'create.CC-task',
        action: ['bpmn:Task', 'activity', 'icon-custom-task-cc palette-title', '抄送任务']
    },
    {
        type: 'create.end-event',
        action: ['bpmn:EndEvent', 'event', 'icon-custom icon-custom-end', '结束节点']
    },
]
const customFlowAction = [
    flowAction
]

export { customShapeAction, customFlowAction }

/**
* 循环创建出一系列的元素
* @param {Array} actions 元素集合
* @param {Object} fn 处理的函数
*/
export function batchCreateCustom(actions, fn) {
    const customs = {}
    actions.forEach(item => {
        customs[item['type']] = fn(...item['action'])
    })
    return customs
}
