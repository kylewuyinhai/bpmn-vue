
const flowAction = { // 线
    type: 'global-connect-tool',
    action: ['bpmn:SequenceFlow', 'tools', 'bpmn-icon-connection-multi', '连接线']
}
const customShapeAction = [ // shape
    {
        type: 'create.start-event',
        action: ['bpmn:StartEvent', 'event', 'bpmn-icon-start-event-none', '开始节点']
    },
    {
        type: 'create.task',
        action: ['bpmn:Task', 'activity', 'bpmn-icon-task', '普通任务']
    },
    {
        type: 'create.business-rules-task',
        action: ['bpmn:BusinessRuleTask', 'activity', 'bpmn-icon-business-rule-task', '转填任务']
    },
    {
        type: 'create.mail-task',
        action: ['bpmn:SendTask', 'activity', 'bpmn-icon-send-task', '抄送任务']
    },
    {
        type: 'create.end-event',
        action: ['bpmn:EndEvent', 'event', 'bpmn-icon-end-event-none', '结束节点']
    },

    // {
    //     type: 'create.businessRule-task',
    //     action: ['bpmn:BusinessRuleTask', 'activity', 'icon-custom icon-custom-businessRule', 'businessRule任务']
    // },
    // {
    //     type: 'create.exclusive-gateway',
    //     action: ['bpmn:ExclusiveGateway', 'activity', 'icon-custom icon-custom-exclusive-gateway', '网关']
    // },
    // {
    //     type: 'create.dataObjectReference',
    //     action: ['bpmn:DataObjectReference', 'activity', 'icon-custom icon-custom-data', '变量']
    // }
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
