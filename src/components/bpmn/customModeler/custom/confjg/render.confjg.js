const customElements = ['bpmn:StartEvent', 'bpmn:EndEvent', 'bpmn:Task', 'bpmn:BusinessRuleTask', 'bpmn:SendTask', 'bpmn:DataObjectReference'] // 自定义元素的类型
const STATICPATH = 'https://hexo-blog-1256114407.cos.ap-shenzhen-fsi.myqcloud.com/' // 静态文件路径
const customConfig = { // 自定义元素的配置
    'bpmn:StartEvent': {
        'field': 'start',
        'title': '开始节点',
        'attr': { x: 0, y: 0, width: 100, height: 100 }
    },
    'bpmn:EndEvent': {
        'field': 'end',
        'title': '结束节点',
        'attr': { x: 0, y: 0, width: 60, height: 60 }
    },
    'bpmn:SequenceFlow': {
        'field': 'flow',
        'title': '连接线',
    },
    'bpmn:Task': {
        'field': 'rules',
        'title': '普通任务',
        'attr': { x: 0, y: 0, width: 60, height: 60 }
    },
    'bpmn:BusinessRuleTask': {
        'field': 'variable',
        'title': '转填任务',
        'attr': { x: 0, y: 0, width: 60, height: 60 }
    },
    'bpmn:SendTask': {
        'field': 'variable',
        'title': '抄送任务',
        'attr': { x: 0, y: 0, width: 60, height: 60 }
    },
    'bpmn:ExclusiveGateway': {
        'field': 'decision',
        'title': '网关',
        'attr': { x: 0, y: 0, width: 60, height: 60 }
    }
}
const hasLabelElements = ['bpmn:StartEvent', 'bpmn:EndEvent', 'bpmn:ExclusiveGateway', 'bpmn:DataObjectReference'] // 一开始就有label标签的元素类型

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
        type: 'create.task',
        action: ['bpmn:UserTask', 'activity', 'bpmn-icon-user-task', '普通任务']
    },
    {
        type: 'create.business-rsule-task',
        action: ['bpmn:BusinessRuleTask', 'activity', 'bpmn-icon-business-rule-task', '转填任务']
    },
    {
        type: 'create.mail-task',
        action: ['bpmn:SendTask', 'activity', 'bpmn-icon-send-task', '转填任务']
    },
    {
        type: 'create.exclusive-gateway',
        action: ['bpmn:ExclusiveGateway', 'activity', 'bpmn-icon-gateway-none', '网关']
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