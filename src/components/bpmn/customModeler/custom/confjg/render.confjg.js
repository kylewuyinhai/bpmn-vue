const customElements = ['bpmn:StartEvent', 'bpmn:EndEvent', 'bpmn:UserTask', 'bpmn:BusinessRuleTask', 'bpmn:SendTask'] // 自定义元素的类型
const STATICPATH = 'https://hexo-blog-1256114407.cos.ap-shenzhen-fsi.myqcloud.com/' // 静态文件路径
const customConfig = { // 自定义元素的配置
    'bpmn:StartEvent': {
        'field': 'start',
        'title': '开始节点',
        'attr': { x: 0, y: 0, width: 80, height: 80 }
    },
    'bpmn:EndEvent': {
        'field': 'end',
        'title': '结束节点',
        'attr': { x: 0, y: 0, width: 80, height: 80 }
    },
    'bpmn:SequenceFlow': {
        'field': 'flow',
        'title': '连接线',
    },
    'bpmn:UserTask': {
        'field': 'rules',
        'title': '普通任务',
        'attr': { x: 0, y: 0, width: 80, height: 80 }
    },
    'bpmn:BusinessRuleTask': {
        'field': 'decision',
        'title': '转填任务',
        'attr': { x: 0, y: 0, width: 80, height: 80 }
    },
    'bpmn:SendTask': {
        'field': 'variable',
        'title': '抄送任务',
        'attr': { x: 0, y: 0, width: 80, height: 80 }
    },
    'bpmn:ExclusiveGateway': {
        'field': 'decision',
        'title': '网关',
        'attr': { x: 0, y: 0, width: 80, height: 80 }
    }
}
const hasLabelElements = [ 'bpmn:ExclusiveGateway', 'bpmn:DataObjectReference'] // 一开始就有label标签的元素类型

const flowAction = {
    type: 'global-connect-tool',
    action: ['bpmn:SequenceFlow', 'tools', 'bpmn-icon-connection-multi', '连接线']
}
const customShapeAction = [{
        type: 'create.start-event',
        action: ['bpmn:StartEvent', 'event', 'bpmn-icon-start-event-none', '开始节点']
    },
    {
        type: 'create.end-event',
        action: ['bpmn:EndEvent', 'event', 'bpmn-icon-end-event-none', '结束节点']
    },
    {
        type: 'create.user-task',
        action: ['bpmn:UserTask', 'activity', 'bpmn-icon-user-task', '普通任务']
    },
    {
        type: 'create.business-rsule-task',
        action: ['bpmn:BusinessRuleTask', 'activity', 'bpmn-icon-business-rule-task', '转填任务']
    },
    {
        type: 'create.cc-task',
        action: ['bpmn:SendTask', 'activity', 'bpmn-icon-send-task', '转填任务']
    },
    {
        type: 'create.exclusive-gateway',
        action: ['bpmn:ExclusiveGateway', 'activity', 'bpmn-icon-gateway-none', '网关']
    },
    { // 线
        type: 'global-connect-tool',
        action: ['bpmn:SequenceFlow', 'tools', 'bpmn-icon-connection-multi', '连接线']
    }
]
const customFlowAction = [
        flowAction
    ]
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


export { customElements, customConfig, STATICPATH, hasLabelElements, customShapeAction, customFlowAction }