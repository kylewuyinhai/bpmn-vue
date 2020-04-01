<template>
  <div  v-if='!rootElement' ref="propertyPanel" class="property-panel">
    <h3 class="panel-title">属性</h3>
    <el-collapse v-model="activeName">
      <el-collapse-item name="1">
        <template slot="title">
          <span class="el_title">通用</span>
        </template>
        <el-form :model="form" label-width="100px" size="small">
          <el-form-item label="key">
            <el-input v-model="form.id" clearable placeholder="请输入key" class="el_input" @input="updateKey" />
          </el-form-item>
          <el-form-item label="任务名称">
            <el-input v-model="form.name" clearable placeholder="请输入名称" class="el_input" @input="updateName" />
          </el-form-item>
          <el-form-item label="处理方式">
            <el-radio-group v-model="form.handleMode">
            <el-radio :label="3">抢先</el-radio>
            <el-radio :label="6">会签</el-radio>
          </el-radio-group>
          </el-form-item>
          <div v-if="rootElement">
            <el-form-item label="版本号">
              <el-input v-model="form.versionTag" clearable placeholder="请输入版本号" class="el_input" @input="updateProperties({versionTag: form.version})" />
            </el-form-item>
            <el-form-item label="任务级别">
              <el-input v-model="form.taskPriority" clearable placeholder="请输入任务优先级" class="el_input" @input="updateProperties({taskPriority: form.taskPriority})" />
            </el-form-item>
            <el-form-item label="工作级别">
              <el-input v-model="form.jobPriority" clearable placeholder="请输入工作优先级" class="el_input" @input="updateProperties({jobPriority: form.jobPriority})" />
            </el-form-item>
            <el-form-item label="保留时间">
              <el-input v-model="form.historyTimeToLive" clearable placeholder="请输入保留时间" class="el_input" @input="updateProperties({historyTimeToLive: form.historyTimeToLive})" />
            </el-form-item>
            <el-form-item label="描述">
              <el-input v-model="form.description" :rows="3" type="textarea" clearable placeholder="请输入描述" class="el_input" @input="updateDocumentation" />
            </el-form-item>
          </div>
        </el-form>
      </el-collapse-item>
      <el-collapse-item name="2">
        <template slot="title">
          <span class="el_title">执行人</span>
        </template>
        <el-form :model="form" label-width="100px" size="small">
          <el-form-item label="执行人类型">
            <el-select v-model="form.id" placeholder="指定执行人">
              <el-option label="餐厅名" value="1"></el-option>
              <el-option label="订单号" value="2"></el-option>
              <el-option label="用户电话" value="3"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="选择执行人">
            <el-input v-model="form.name" clearable placeholder="请输入名称" class="el_input" @input="updateName" />
          </el-form-item>
        </el-form>
      </el-collapse-item>
      <el-collapse-item name="3">
        <template slot="title">
          <span class="el_title">操作</span>
        </template>
        <el-form :model="form" label-width="100px" size="small">
          <el-form-item label="回退方式">
              <el-radio-group v-model="form.handleMode">
              <el-radio :label="3">抢先</el-radio>
              <el-radio :label="6">会签</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="不满足条件时">
              <el-radio-group v-model="form.handleMode">
              <el-radio :label="3">抢先</el-radio>
              <el-radio :label="6">会签</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="消息提醒">
            <el-checkbox-group v-model="form.checkList">
              <el-checkbox label="复选框 A"></el-checkbox>
              <el-checkbox label="复选框 B"></el-checkbox>
              <el-checkbox label="复选框 C"></el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-form>
      </el-collapse-item>
      <el-collapse-item v-if="isUserTask">
        <template slot="title">
          <span class="el_title">审核者<i class="header-icon el-icon-info" /></span>
        </template>
        <el-form ref="userTaskForm" :model="userTask" label-width="100px" size="small">
          <el-form-item label="处理人">
            <el-radio-group v-model="userTask.assigneeType" @change="handleChangeAssignee">
              <el-radio label="1">指定用户</el-radio>
              <el-radio label="2">流程发起人</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item v-if="userTask.assigneeType === '1'">
            <el-input v-model="userTask.assigneeName" clearable readonly placeholder="请选择处理人" class="el_input">
              <el-button slot="append" icon="el-icon-plus" @click="handleSelectUser(false, 'assignee')" />
            </el-input>
          </el-form-item>
          <el-form-item label="候选用户">
            <el-input v-model="userTask.candidateUsersName" clearable readonly placeholder="请选择候选用户" class="el_input">
              <el-button slot="append" icon="el-icon-plus" @click="handleSelectUser(true, 'candidateUsers')" />
            </el-input>
          </el-form-item>
          <el-form-item label="候选用户组">
            <el-input v-model="userTask.candidateGroups" clearable readonly placeholder="请选择候选用户组" class="el_input" @input="updateProperties({candidateGroups: userTask.candidateGroups})">
              <el-button slot="append" icon="el-icon-plus" />
            </el-input>
          </el-form-item>
        </el-form>
      </el-collapse-item>
      
    </el-collapse>
    <user-select ref="UserSelect" @callback="handleCallback" />
  </div>
</template>

<script>
import cmdHelper from './CustomPanel/lib/helper/CmdHelper'
import elementHelper from './CustomPanel/lib/helper/ElementHelper'
import extensionElementsHelper from './CustomPanel/lib/helper/ExtensionElementsHelper'
import ImplementationTypeHelper from './CustomPanel/lib/helper/ImplementationTypeHelper'
import UserSelect from './UserSelect'
import { randomString } from './utils'

export default {
  name: 'PropertyPanel',
  components: {
    UserSelect,
  },
  props: {
    modeler: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      selectedElements: [],
      element: {},
      rootElement: null,
      activeName: ['1', '2', '3'],
      // 人员选择的类型
      selectType: '',
      // 选中的代理人
      selectedAssignee: '',
      // 选中的监听器数组
      listenerData: [],
      // 监听器
      listener: {},
      // 选中的任务监听器数组
      taskListenerData: [],
      // 任务监听器
      taskListener: {},
      isTaskListener: false,
      listenerType: {
        class: '类',
        expression: '表达式',
        delegateExpression: '代理表达式'
      },
      // 按钮
      buttonsData: [],
      button: [],
      form: {
        id: '',
        name: '',
        versionTag: '',
        taskPriority: '',
        jobPriority: '',
        candidateStarterGroups: '',
        candidateStarterUsersNames: '',
        candidateStarterUsers: '',
        historyTimeToLive: '',
        // 流程发起人
        initiator: '',
        description: ''
      },
      userTask: {
        assigneeType: '1',
        assigneeName: '',
        assignee: '',
        candidateUsersName: '',
        candidateUsers: '',
        candidateGroups: ''
      },
      exclusiveSequence: {
        conditionExpression: ''
      }
    }
  },
  computed: {
    isEvent() {
      if (!this.element) {
        return
      }
      return this.verifyIsEvent(this.element.type)
    },
    isTask() {
      if (!this.element) {
        return
      }
      return this.verifyIsTask(this.element.type)
    },
    isUserTask() {
      if (!this.element) {
        return
      }
      return this.element.type === 'bpmn:UserTask'
    },
    isStart() {
      if (!this.element) {
        return
      }
      return this.verifyIsStart(this.element.type)
    },
    sequenceFlow() {
      if (!this.element) {
        return
      }
      return this.element.type === 'bpmn:SequenceFlow'
    },
    isExclusiveSequenceFlow() {
      if (!this.element) {
        return
      }
      const { businessObject } = this.element
      if (businessObject && businessObject.sourceRef && businessObject.sourceRef.$type === 'bpmn:ExclusiveGateway') {
        return true
      }
      return false
    },
    isGateway() {
      if (!this.element) {
        return
      }
      return this.verifyIsGateway(this.element.type)
    }
  },
  created() {
    this.init()
  },
  methods: {
    randomString,
    init() {
      const that = this
      this.modeler.on('selection.changed', e => {
        that.selectedElements = e.newSelection
        that.element = e.newSelection[0]
        that.rootElement = null
        that.setDefaultProperties(that.element)
      })
      this.modeler.on('element.changed', e => {
        const { element } = e
        const { element: currentElement } = this
        if (!currentElement) {
          return
        }
        // update panel, if currently selected element changed
        if (element.id === currentElement.id) {
          this.element = element
        }
      })
      this.modeler.on('element.click', e => {
        if (!that.element) {
          that.rootElement = e.element
          that.setDefaultProperties(that.rootElement)
        }
      })
      this.modeler.on('root.added', function(e) {
        if (!that.element) {
          that.rootElement = e.element
          that.setDefaultProperties(that.rootElement)
        }
      })
    },
    setDefaultProperties(element) {
      console.log(element)
      if (element) {
        const { businessObject } = element
        const candidateStarterUsersNames = this.form.candidateStarterUsersNames
        this.form = {
          ...businessObject,
          ...businessObject.$attrs
        }
        this.form.candidateStarterUsersNames = candidateStarterUsersNames
        if (element.type === 'bpmn:Process') {
          this.setProcessUser()
        } else if (this.isUserTask) {
          this.setUserTaskUser()
        }
        this.setListener(element, businessObject)
        this.setTaskListener(element, businessObject)
        if (businessObject.documentation) {
          // this.form.description = businessObject.documentation[0].text
        }
      }
    },
    setListener(element, businessObject) {
      // 执行监听器
      this.listenerData = this.listener[element.id] || []
      if (this.listenerData.length === 0) {
        const listeners = extensionElementsHelper.getExtensionElements(businessObject, 'flowable:ExecutionListener') || []
        for (let i = 0; i < listeners.length; i++) {
          const listener = listeners[i]
          const listenerType = ImplementationTypeHelper.getImplementationType(listener)
          this.listenerData.push({
            id: randomString(16),
            eventType: listener.event || '',
            listenerType: listenerType,
            value: listener[listenerType]
          })
        }
        this.listener[element.id] = this.listenerData
      }
    },
    setTaskListener(element, businessObject) {
      // 任务监听器
      this.taskListenerData = this.taskListener[element.id] || []
      if (this.taskListenerData.length === 0) {
        const listeners = extensionElementsHelper.getExtensionElements(businessObject, 'flowable:TaskListener') || []
        for (let i = 0; i < listeners.length; i++) {
          const listener = listeners[i]
          const listenerType = ImplementationTypeHelper.getImplementationType(listener)
          this.taskListenerData.push({
            id: randomString(16),
            eventType: listener.event || '',
            listenerType: listenerType,
            value: listener[listenerType]
          })
        }
        this.taskListener[element.id] = this.taskListenerData
      }
    },
    setProcessUser() {
      let userIds = []
      if (this.form.candidateStarterUsers) {
        userIds = this.form.candidateStarterUsers.split(',')
      }
      if (userIds.length === 0) return
      // 调用服务端接口
      // userByIds({ userIds: userIds }).then(res => {
      //   const candidateStarterUsersNames = []
      //   const candidateStarterUsers = this.form.candidateStarterUsers
      //   if (!candidateStarterUsers) return
      //   for (let i = 0; i < res.length; i++) {
      //     const user = res[i]
      //     if (candidateStarterUsers.includes(user.id)) {
      //       candidateStarterUsersNames.push(user.realName)
      //     }
      //   }
      //   this.form.candidateStarterUsersNames = candidateStarterUsersNames.join(',')
      // })
    },
    setUserTaskUser() {
      const userIds = []
      if (this.userTask.assignee) {
        userIds.push(this.userTask.assignee)
      }
      if (this.userTask.candidateUsers) {
        const candidateUsers = this.userTask.candidateUsers.split(',')
        userIds.push(candidateUsers)
      }
      if (userIds.length === 0) return
      // 调用服务端接口
      // userByIds({ userIds: userIds }).then(res => {
      //   const candidateUsersNames = []
      //   const candidateUsers = this.userTask.candidateUsers
      //   for (let i = 0; i < res.length; i++) {
      //     const user = res[i]
      //     if (this.userTask.assignee === user.id) {
      //       this.userTask.assigneeName = user.realName
      //     }
      //     if (candidateUsers.includes(user.id)) {
      //       candidateUsersNames.push(user.realName)
      //     }
      //   }
      //   if (candidateUsersNames.length > 0) {
      //     this.userTask.candidateUsersName = candidateUsersNames.join(',')
      //   }
      // })
    },
    verifyIsEvent(type) {
      if (!type) return
      return type.includes('Event')
    },
    verifyIsTask(type) {
      if (!type) return
      return type.includes('Task')
    },
    verifyIsStart(type) {
      return type === 'bpmn:StartEvent'
    },
    verifyIsGateway(type) {
      if (!type) return
      return type.includes('Gateway')
    },
    /**
     * 改变控件触发的事件
     * @param { Object } input的Event
     * @param { String } 要修改的属性的名称
     */
    changeField(event, type) {
      const value = event.target.value
      this.element[type] = value
      const properties = {}
      properties[type] = value
      if (type === 'color') {
        this.onChangeColor(value)
      }
      this.updateProperties(properties)
    },
    updateName(name) {
      this.updateProperties({ name: name })
    },
    updateKey(key) {
      this.updateProperties({ id: key })
    },
    changeEventType(event) {
      const { modeler, element } = this
      const value = event.target.value
      const bpmnReplace = modeler.get('bpmnReplace')
      this.eventType = value
      bpmnReplace.replaceElement(element, {
        type: element.businessObject.$type,
        eventDefinitionType: value
      })
    },
    changeTaskType(event) {
      const { modeler, element } = this
      const value = event.target.value
      const bpmnReplace = modeler.get('bpmnReplace')
      bpmnReplace.replaceElement(element, {
        type: value
      })
    },
    /**
     * 更新元素属性
     * @param { Object } 要更新的属性, 例如 { name: '' }
     */
    updateProperties(properties) {
      const modeling = this.modeler.get('modeling')
      modeling.updateProperties(this.element ? this.element : this.rootElement, properties)
    },
    // 文档描述设置
    updateDocumentation(value) {
      const bpmnFactory = this.modeler.get('bpmnFactory')
      if (value) {
        const newObjectList = []
        newObjectList.push(bpmnFactory.create('bpmn:Documentation', {
          text: value
        }))
        const element = this.rootElement
        const command = cmdHelper.setList(element, element.businessObject, 'documentation', newObjectList)
        this.executeCommand(command)
      }
    },
    // 条件分支设置
    updateConditionExpression() {
      if (!this.element) return
      const { businessObject } = this.element
      const bpmnFactory = this.modeler.get('bpmnFactory')
      const conditionOrConditionExpression = elementHelper.createElement(
        'bpmn:FormalExpression',
        {
          body: this.exclusiveSequence.conditionExpression
        },
        businessObject,
        bpmnFactory
      )

      const command = cmdHelper.updateBusinessObject(this.element, businessObject, {
        conditionExpression: conditionOrConditionExpression
      })
      this.executeCommand(command)
    },
    executeCommand(command) {
      const commandStack = this.modeler.get('commandStack')
      commandStack.execute(command.cmd, command.context)
    },
    handleChangeAssignee(value) {
      if (value === '2') {
        this.selectedAssignee = this.userTask.assignee
        this.userTask.assignee = '$INITIATOR'
      } else {
        this.userTask.assignee = this.selectedAssignee
      }
      this.updateProperties({ assignee: this.userTask.assignee })
    },
    handleSelectUser(multiple, type) {
      this.selectType = type
      // 这个里选人可以根据自己的系统自定义
      const _this = this.$refs.UserSelect
      _this.multiple = multiple
      _this.dialog = true
    },
    handleCallback(selectedUsers) {
      const userIds = []
      const userNames = []
      for (let i = 0; i < selectedUsers.length; i++) {
        userIds.push(selectedUsers[i].id)
        userNames.push(selectedUsers[i].realName)
      }
      if (this.selectType === 'candidateStarterUsers') {
        this.form.candidateStarterUsers = userIds.join(',')
        this.form.candidateStarterUsersNames = userNames.join(',')
        this.updateProperties({ candidateStarterUsers: this.form.candidateStarterUsers })
      } else if (this.selectType === 'assignee') {
        this.userTask.assignee = userIds.join(',')
        this.userTask.assigneeName = userNames.join(',')
        this.updateProperties({ assignee: this.userTask.assignee })
      } else if (this.selectType === 'candidateUsers') {
        this.userTask.candidateUsers = userIds.join(',')
        this.userTask.candidateUsersName = userNames.join(',')
        this.updateProperties({ candidateUsers: this.userTask.candidateUsersName })
      }
      this.$forceUpdate()
    },
    addListeners(isTaskListener) {
      this.isTaskListener = isTaskListener
      let _this = this.$refs.FlowListener
      if (isTaskListener) {
        _this = this.$refs.FlowTaskListener
      }
      _this.dialog = true
    },
    handleListenerCallback(val) {
      const bpmnFactory = this.modeler.get('bpmnFactory')
      const element = this.rootElement ? this.rootElement : this.element
      const bo = element.businessObject
      let type = ''
      let data
      // 执行监听器
      if (!this.isTaskListener) {
        type = 'flowable:ExecutionListener'
        for (let i = 0; i < this.listenerData.length; i++) {
          data = this.listenerData[i]
          if (data.id === val.id) {
            break
          }
        }
        this.listenerData.push(val)
        this.listener[element.id] = this.listenerData
      } else {
        type = 'flowable:TaskListener'
        for (let i = 0; i < this.taskListenerData.length; i++) {
          data = this.taskListenerData[i]
          if (data.id === val.id) {
            break
          }
        }
        this.taskListenerData.push(val)
        this.taskListener[element.id] = this.taskListenerData
      }
      if (data) {
        this.listenerDel(data)
      }
      let extensionElements = bo.extensionElements
      if (!extensionElements) {
        extensionElements = elementHelper.createElement('bpmn:ExtensionElements', { values: [] }, bo, bpmnFactory)
        this.executeCommand(cmdHelper.updateBusinessObject(element, bo, { extensionElements: extensionElements }))
      }
      this.executeCommand(this.createExtensionElement(element, type, extensionElements, val, bpmnFactory))
    },
    // 创建扩展元素
    createExtensionElement(element, type, extensionElements, value, bpmnFactory) {
      const props = {
        event: value.eventType
      }
      props[value.listenerType] = value.value
      const newElem = elementHelper.createElement(type, props, extensionElements, bpmnFactory)

      return cmdHelper.addElementsTolist(element, extensionElements, 'values', [newElem])
    },
    // 删除扩展元素
    removeExtensionElement(element, bo, type, idx) {
      const listeners = extensionElementsHelper.getExtensionElements(bo, type) || []
      const listener = listeners[idx]
      if (listener) {
        return extensionElementsHelper.removeEntry(bo, element, listener)
      }
    },
    updateListener(data, isTaskListener) {
      this.isTaskListener = isTaskListener
      let _this = this.$refs.FlowListener
      if (isTaskListener) {
        _this = this.$refs.FlowTaskListener
      }
      _this.form = {
        ...data
      }
      _this.dialog = true
    },
    listenerDel(val, isTaskListener) {
      this.isTaskListener = isTaskListener
      let idx
      let type
      const element = this.rootElement ? this.rootElement : this.element
      const bo = element.businessObject
      // 执行监听器
      if (!isTaskListener) {
        idx = this.listenerData.indexOf(val)
        this.listenerData.splice(idx, 1)
        type = 'flowable:ExecutionListener'
      } else {
        idx = this.taskListenerData.indexOf(val)
        this.taskListenerData.splice(idx, 1)
        type = 'flowable:TaskListener'
      }
      this.executeCommand(this.removeExtensionElement(element, bo, type, idx))
    },
    addButton() {
      const _this = this.$refs.FlowButton
      _this.multipleSelection = this.buttonsData
      this.buttonsData.forEach(row => {
        _this.$refs.multipleTable.toggleRowSelection(row)
      })
      _this.dialog = true
    },
    handleButtonCallback(datas) {
      this.buttonsData = datas
      const bpmnFactory = this.modeler.get('bpmnFactory')
      const element = this.rootElement ? this.rootElement : this.element
      const bo = element.businessObject
      let extensionElements = bo.extensionElements
      if (!extensionElements) {
        extensionElements = elementHelper.createElement('bpmn:ExtensionElements', { values: [] }, bo, bpmnFactory)
        this.executeCommand(cmdHelper.updateBusinessObject(element, bo, { extensionElements: extensionElements }))
      }
      const newElems = []
      for (let i = 0; i < this.buttonsData.length; i++) {
        const button = this.buttonsData[i]
        const props = {
          name: button.name,
          code: button.action
        }
        const newElem = elementHelper.createElement('flowable:Button', props, extensionElements, bpmnFactory)
        newElems.push(newElem)
      }
      this.executeCommand(cmdHelper.addElementsTolist(element, extensionElements, 'values', newElems))
    },
    removeButton(data) {
      const idx = this.buttonsData.indexOf(data)
      const type = 'flowable:Button'
      this.buttonsData.splice(idx, 1)
      const element = this.rootElement ? this.rootElement : this.element
      const bo = element.businessObject
      this.executeCommand(this.removeExtensionElement(element, bo, type, idx))
    },
    checkList() {
      console.log('成功');
      
    }
  }
}
</script>

<style>
.panel-title{
  margin-left: 20px;
  font-weight: normal; 
}
  .property-panel {
    width: 398px;
  }
  .el_title {
    padding-left: 20px;
  }
  .el_input {
    width: 280px;
  }
</style>
