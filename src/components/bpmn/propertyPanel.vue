<template>
  <div v-if="!rootElement" ref="propertyPanel" class="property-panel">
    <h3 class="panel-title">属性</h3>
    <el-collapse v-model="activeName">
      <template v-if="!sequenceFlow">
        <el-collapse-item name="1">
          <template slot="title">
            <span class="el_title">通用</span>
          </template>
          <el-form :model="form" label-width="100px" size="small">
            <el-form-item label="任务名称">
              <el-input
                v-model="form.name"
                clearable
                placeholder="请输入名称"
                class="el_input"
                @input="updateName"
              />
            </el-form-item>
            <el-form-item label="处理方式">
              <el-radio-group v-model="form.handleMode" @change="handleChangeModel">
                <el-radio :label="1">抢先</el-radio>
                <el-radio :label="2">会签</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-form>
        </el-collapse-item>
        <el-collapse-item name="2">
          <template slot="title">
            <span class="el_title">{{isStart ? '发起人' : '执行人'}}</span>
          </template>
          <el-form :model="userTask" label-width="100px" size="small">
            <el-form-item :label="isStart ? '发起人类型' : '执行人类型'">
              <el-select
                v-model="userTask.assigneeType"
                placeholder="请选择"
                @change="handelChangeUser($event,'assigneeType')"
              >
                <el-option label="指定执行人" value="1"></el-option>
                <el-option label="指定角色" value="2"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="isStart ? '选择发起人' : '选择执行人'">
              <el-input
                type="text"
                name
                id
                v-model="userTask.assignees"
                @change="handelChangeUser($event,'assignees')"
              />
              <el-card class="box-card">
                <el-tag type="info" class="user-tag">标签一</el-tag>
                <el-tag type="info">标签二</el-tag>
                <el-button class="choose-user" type="text" icon="el-icon-s-tools" circle></el-button>
              </el-card>
            </el-form-item>
          </el-form>
        </el-collapse-item>
        <el-collapse-item v-if="!isSendTask" name="3">
          <template slot="title">
            <span class="el_title">操作</span>
          </template>
          <el-form :model="operation" label-width="100px" size="small">
            <el-form-item v-if="hasSelectForm" label="选择表单">
              <el-input
                v-model="operation.isForm"
                clearable
                class="el_input"
                @change="handleChangeOperation('isForm')"
              >
                <el-button
                  slot="append"
                  icon="el-icon-more"
                  @click="handleChangeOperation('isForm')"
                />
              </el-input>
            </el-form-item>
            <el-form-item v-if="!isStart" label="回退方式">
              <el-radio-group
                v-model="operation.backType"
                @change="handleChangeOperation('backType')"
              >
                <el-radio :label="1">上一步</el-radio>
                <el-radio :label="2">发起人</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="不满足条件时">
              <el-radio-group
                v-model="operation.unCondition"
                @change="handleChangeOperation('unCondition')"
              >
                <el-radio :label="1">结束流程</el-radio>
                <el-radio :label="2">退回发始人</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="消息提醒">
              <el-checkbox-group
                v-model="operation.messageTip"
                @change="handleChangeOperation('messageTip')"
              >
                <el-checkbox :label="1">上一步</el-checkbox>
                <el-checkbox :label="2">下一步</el-checkbox>
                <el-checkbox :label="3">发起人</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-form>
        </el-collapse-item>
      </template>
      <template v-if="sequenceFlow">
        <el-collapse-item name="1">
          <template slot="title">
            <span class="el_title">判断条件</span>
          </template>
          <el-form :model="flow" label-width="100px" size="small">
            <el-form-item>
              <el-input v-model="flow.condition" placeholder @input="updateFlow"></el-input>
            </el-form-item>
          </el-form>
        </el-collapse-item>
        <el-collapse-item name="2" v-if="isSequenceFlowToRule">
          <template slot="title">
            <span class="el_title">传递字段</span>
          </template>
          <el-form :model="flow" label-width="100px" size="small">
            <el-form-item v-if="isSequenceFlowToRule" label="传递字段">
              <el-input
                v-model="form.name"
                clearable
                placeholder="请输入名称"
                class="el_input"
                @input="updateName"
              />
            </el-form-item>
          </el-form>
        </el-collapse-item>
      </template>
    </el-collapse>
    <user-select ref="UserSelect" @callback="handleCallback" />
  </div>
</template>

<script>
import cmdHelper from "./CustomPanel/lib/helper/CmdHelper";
import elementHelper from "./CustomPanel/lib/helper/ElementHelper";
import extensionElementsHelper from "./CustomPanel/lib/helper/ExtensionElementsHelper";
import ImplementationTypeHelper from "./CustomPanel/lib/helper/ImplementationTypeHelper";
import UserSelect from "./UserSelect";
import { randomString } from "./utils";

export default {
  name: "PropertyPanel",
  components: {
    UserSelect
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
      activeName: ["1", "2", "3"],
      // 人员选择的类型
      selectType: "",
      // 选中的代理人
      selectedAssignee: "",
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
        class: "类",
        expression: "表达式",
        delegateExpression: "代理表达式"
      },
      // 按钮
      buttonsData: [],
      button: [],
      form: {
        id: "",
        name: "",
        handleMode: 1,
        versionTag: "",
        taskPriority: "",
        jobPriority: "",
        candidateStarterGroups: "",
        candidateStarterUsersNames: "",
        candidateStarterUsers: "",
        historyTimeToLive: "",
        // 流程发起人
        initiator: "",
        description: ""
      },
      userTask: {
        assigneeType: 1,
        candidateUsersName: ""
      },
      // userTask: {
      //   assigneeType: "1",
      //   assigneeName: "",
      //   assignee: "",
      //   candidateUsersName: "",
      //   candidateUsers: "",
      //   candidateGroups: ""
      // },
      operation: {
        backType: 1,
        unCondition: 1,
        messageTip: [1],
        isForm: ""
      },
      exclusiveSequence: {
        conditionExpression: ""
      },
      // 箭头数据
      flow: {
        condition: "",
        transferData: {}
      }
    };
  },
  computed: {
    isSendTask() {
      if (!this.element) {
        return;
      }
      return this.element.type === "bpmn:SendTask";
    },
    hasSelectForm() {
      if (!this.element) {
        return;
      }
      return (
        this.element.type === "bpmn:StartEvent" ||
        this.element.type === "bpmn:BusinessRuleTask"
      );
    },
    isEvent() {
      if (!this.element) {
        return;
      }
      return this.verifyIsEvent(this.element.type);
    },
    isTask() {
      if (!this.element) {
        return;
      }
      return this.verifyIsTask(this.element.type);
    },
    isUserTask() {
      if (!this.element) {
        return;
      }
      return this.element.type === "bpmn:UserTask";
    },
    isStart() {
      if (!this.element) {
        return;
      }
      return this.verifyIsStart(this.element.type);
    },
    sequenceFlow() {
      if (!this.element) {
        return;
      }
      return this.element.type === "bpmn:SequenceFlow";
    },
    isSequenceFlowToRule() {
      if (!this.element) {
        return;
      }
      return (
        this.element.type === "bpmn:SequenceFlow" &&
        this.element.target.type === "bpmn:BusinessRuleTask"
      );
    },
    isExclusiveSequenceFlow() {
      if (!this.element) {
        return;
      }
      const { businessObject } = this.element;
      if (
        businessObject &&
        businessObject.sourceRef &&
        businessObject.sourceRef.$type === "bpmn:ExclusiveGateway"
      ) {
        return true;
      }
      return false;
    },
    isGateway() {
      if (!this.element) {
        return;
      }
      return this.verifyIsGateway(this.element.type);
    }
  },
  created() {
    this.init();
  },
  methods: {
    randomString,
    init() {
      const that = this;
      this.modeler.on("shape.added", e => {
        console.log(e, "addd");
        this.$nextTick(() => {
          this.element = e.element;
          this.setDefaultProperties(e.element);
        });
        console.log(e, "addd");
      });
      this.modeler.on("selection.changed", e => {
        console.log("selection change");

        that.selectedElements = e.newSelection;
        that.element = e.newSelection[0];
        that.rootElement = null;
        that.setDefaultProperties(that.element);
      });
      this.modeler.on("element.changed", e => {
        console.log("element change");

        const { element } = e;
        const { element: currentElement } = this;
        if (!currentElement) {
          return;
        }
        // update panel, if currently selected element changed
        if (element.id === currentElement.id) {
          this.element = element;
        }
      });
      this.modeler.on("element.click", e => {
        console.log("element click");
        // that.setDefaultProperties(that.element);
        if (!that.element) {
          that.rootElement = e.element;
          that.setDefaultProperties(that.element);
        }
      });
      this.modeler.on("root.added", function(e) {
        if (!that.element) {
          that.rootElement = e.element;
          that.setDefaultProperties(that.rootElement);
        }
      });
    },
    setDefaultProperties(element) {
      console.log(element, "serDefaule");
      if (element) {
        const { businessObject } = element;
        // const candidateStarterUsersNames = this.form.candidateStarterUsersNames;
        this.form = {
          name: businessObject.name,
          handleMode: businessObject.handleMode || 1
        };
        this.userTask = {
          assigneeType: businessObject.assigneeType || "1",
          assignees: businessObject.assignees || ""
        };
        this.operation = {
          backType: +(businessObject.backType || 1),
          unCondition: +(businessObject.unCondition || 1),
          messageTip: businessObject.messageTip || [1],
          isForm: businessObject.isForm || ""
        };
        console.log(typeof businessObject.messageTip);
        if (typeof businessObject.messageTip === "string") {
          this.operation.messageTip = businessObject.messageTip.split(",");
          const temArray = this.operation.messageTip.map(e => {
            return +e;
          });
          this.operation.messageTip = temArray;
        }
        // if(businessObject.$attrs.messageTip){
        //   console.log(businessObject.$attrs.messageTip, typeof businessObject.$attrs.messageTip);

        //   this.operation.messageTip = typeof businessObject.$attrs.messageTip === 'string' ? [...(businessObject.$attrs.messageTip.split(','))] : JSON.parse(JSON.stringify(businessObject.$attrs.messageTip))
        // } else {
        //   this.operation.messageTip = [1]
        // }
        this.flow = {
          condition: businessObject.condition || "",
          transferData: businessObject.transferData || {}
        };
        // this.form.candidateStarterUsersNames = candidateStarterUsersNames;
        // if (element.type === "bpmn:Process") {
        //   this.setProcessUser();
        // } else if (this.isUserTask) {
        //   this.setUserTaskUser();
        // }
        // this.setListener(element, businessObject);
        // this.setTaskListener(element, businessObject);
        // if (businessObject.documentation) {
        //   // this.form.description = businessObject.documentation[0].text
        // }
      }
    },
    setListener(element, businessObject) {
      // 执行监听器
      this.listenerData = this.listener[element.id] || [];
      if (this.listenerData.length === 0) {
        const listeners =
          extensionElementsHelper.getExtensionElements(
            businessObject,
            "flowable:ExecutionListener"
          ) || [];
        for (let i = 0; i < listeners.length; i++) {
          const listener = listeners[i];
          const listenerType = ImplementationTypeHelper.getImplementationType(
            listener
          );
          this.listenerData.push({
            id: randomString(16),
            eventType: listener.event || "",
            listenerType: listenerType,
            value: listener[listenerType]
          });
        }
        this.listener[element.id] = this.listenerData;
      }
    },
    setTaskListener(element, businessObject) {
      // 任务监听器
      this.taskListenerData = this.taskListener[element.id] || [];
      if (this.taskListenerData.length === 0) {
        const listeners =
          extensionElementsHelper.getExtensionElements(
            businessObject,
            "flowable:TaskListener"
          ) || [];
        for (let i = 0; i < listeners.length; i++) {
          const listener = listeners[i];
          const listenerType = ImplementationTypeHelper.getImplementationType(
            listener
          );
          this.taskListenerData.push({
            id: randomString(16),
            eventType: listener.event || "",
            listenerType: listenerType,
            value: listener[listenerType]
          });
        }
        this.taskListener[element.id] = this.taskListenerData;
      }
    },
    setProcessUser() {
      let userIds = [];
      if (this.form.candidateStarterUsers) {
        userIds = this.form.candidateStarterUsers.split(",");
      }
      if (userIds.length === 0) return;
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
      const userIds = [];
      if (this.userTask.assignee) {
        userIds.push(this.userTask.assignee);
      }
      if (this.userTask.candidateUsers) {
        const candidateUsers = this.userTask.candidateUsers.split(",");
        userIds.push(candidateUsers);
      }
      if (userIds.length === 0) return;
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
    verifyConnection(type) {
      if (!type) return;
      return type.includes("bpmn:SequenceFlow");
    },
    verifyIsEvent(type) {
      if (!type) return;
      return type.includes("Event");
    },
    verifyIsTask(type) {
      if (!type) return;
      return type.includes("Task");
    },
    verifyIsStart(type) {
      return type === "bpmn:StartEvent";
    },
    verifyIsGateway(type) {
      if (!type) return;
      return type.includes("Gateway");
    },
    /**
     * 改变控件触发的事件
     * @param { Object } input的Event
     * @param { String } 要修改的属性的名称
     */
    changeField(event, type) {
      const value = event.target.value;
      this.element[type] = value;
      const properties = {};
      properties[type] = value;
      if (type === "color") {
        this.onChangeColor(value);
      }
      this.updateProperties(properties);
    },
    updateName(name) {
      this.updateProperties({ name: name });
    },
    updateKey(key) {
      this.updateProperties({ id: key });
    },
    changeEventType(event) {
      const { modeler, element } = this;
      const value = event.target.value;
      const bpmnReplace = modeler.get("bpmnReplace");
      this.eventType = value;
      bpmnReplace.replaceElement(element, {
        type: element.businessObject.$type,
        eventDefinitionType: value
      });
    },
    changeTaskType(event) {
      const { modeler, element } = this;
      const value = event.target.value;
      const bpmnReplace = modeler.get("bpmnReplace");
      bpmnReplace.replaceElement(element, {
        type: value
      });
    },
    /**
     * 更新元素属性
     * @param { Object } 要更新的属性, 例如 { name: '' }
     */
    updateProperties(properties) {
      const modeling = this.modeler.get("modeling");
      console.log(this.element);

      modeling.updateProperties(
        this.element ? this.element : this.rootElement,
        properties
      );
    },
    // 文档描述设置
    updateDocumentation(value) {
      const bpmnFactory = this.modeler.get("bpmnFactory");
      if (value) {
        const newObjectList = [];
        newObjectList.push(
          bpmnFactory.create("bpmn:Documentation", {
            text: value
          })
        );
        const element = this.rootElement;
        const command = cmdHelper.setList(
          element,
          element.businessObject,
          "documentation",
          newObjectList
        );
        this.executeCommand(command);
      }
    },
    // 条件分支设置
    updateConditionExpression() {
      if (!this.element) return;
      const { businessObject } = this.element;
      const bpmnFactory = this.modeler.get("bpmnFactory");
      const conditionOrConditionExpression = elementHelper.createElement(
        "bpmn:FormalExpression",
        {
          body: this.exclusiveSequence.conditionExpression
        },
        businessObject,
        bpmnFactory
      );

      const command = cmdHelper.updateBusinessObject(
        this.element,
        businessObject,
        {
          conditionExpression: conditionOrConditionExpression
        }
      );
      this.executeCommand(command);
    },
    executeCommand(command) {
      const commandStack = this.modeler.get("commandStack");
      commandStack.execute(command.cmd, command.context);
    },
    handleChangeAssignee(value) {
      if (value === "2") {
        this.selectedAssignee = this.userTask.assignee;
        this.userTask.assignee = "$INITIATOR";
      } else {
        this.userTask.assignee = this.selectedAssignee;
      }
      this.updateProperties({ assignee: this.userTask.assignee });
    },
    handleSelectUser(multiple, type) {
      this.selectType = type;
      // 这个里选人可以根据自己的系统自定义
      const _this = this.$refs.UserSelect;
      _this.multiple = multiple;
      _this.dialog = true;
    },
    handleCallback(selectedUsers) {
      const userIds = [];
      const userNames = [];
      for (let i = 0; i < selectedUsers.length; i++) {
        userIds.push(selectedUsers[i].id);
        userNames.push(selectedUsers[i].realName);
      }
      if (this.selectType === "candidateStarterUsers") {
        this.form.candidateStarterUsers = userIds.join(",");
        this.form.candidateStarterUsersNames = userNames.join(",");
        this.updateProperties({
          candidateStarterUsers: this.form.candidateStarterUsers
        });
      } else if (this.selectType === "assignee") {
        this.userTask.assignee = userIds.join(",");
        this.userTask.assigneeName = userNames.join(",");
        this.updateProperties({ assignee: this.userTask.assignee });
      } else if (this.selectType === "candidateUsers") {
        this.userTask.candidateUsers = userIds.join(",");
        this.userTask.candidateUsersName = userNames.join(",");
        this.updateProperties({
          candidateUsers: this.userTask.candidateUsersName
        });
      }
      this.$forceUpdate();
    },
    addListeners(isTaskListener) {
      this.isTaskListener = isTaskListener;
      let _this = this.$refs.FlowListener;
      if (isTaskListener) {
        _this = this.$refs.FlowTaskListener;
      }
      _this.dialog = true;
    },
    handleListenerCallback(val) {
      const bpmnFactory = this.modeler.get("bpmnFactory");
      const element = this.rootElement ? this.rootElement : this.element;
      const bo = element.businessObject;
      let type = "";
      let data;
      // 执行监听器
      if (!this.isTaskListener) {
        type = "flowable:ExecutionListener";
        for (let i = 0; i < this.listenerData.length; i++) {
          data = this.listenerData[i];
          if (data.id === val.id) {
            break;
          }
        }
        this.listenerData.push(val);
        this.listener[element.id] = this.listenerData;
      } else {
        type = "flowable:TaskListener";
        for (let i = 0; i < this.taskListenerData.length; i++) {
          data = this.taskListenerData[i];
          if (data.id === val.id) {
            break;
          }
        }
        this.taskListenerData.push(val);
        this.taskListener[element.id] = this.taskListenerData;
      }
      if (data) {
        this.listenerDel(data);
      }
      let extensionElements = bo.extensionElements;
      if (!extensionElements) {
        extensionElements = elementHelper.createElement(
          "bpmn:ExtensionElements",
          { values: [] },
          bo,
          bpmnFactory
        );
        this.executeCommand(
          cmdHelper.updateBusinessObject(element, bo, {
            extensionElements: extensionElements
          })
        );
      }
      this.executeCommand(
        this.createExtensionElement(
          element,
          type,
          extensionElements,
          val,
          bpmnFactory
        )
      );
    },
    // 创建扩展元素
    createExtensionElement(
      element,
      type,
      extensionElements,
      value,
      bpmnFactory
    ) {
      const props = {
        event: value.eventType
      };
      props[value.listenerType] = value.value;
      const newElem = elementHelper.createElement(
        type,
        props,
        extensionElements,
        bpmnFactory
      );

      return cmdHelper.addElementsTolist(element, extensionElements, "values", [
        newElem
      ]);
    },
    // 删除扩展元素
    removeExtensionElement(element, bo, type, idx) {
      const listeners =
        extensionElementsHelper.getExtensionElements(bo, type) || [];
      const listener = listeners[idx];
      if (listener) {
        return extensionElementsHelper.removeEntry(bo, element, listener);
      }
    },
    updateListener(data, isTaskListener) {
      this.isTaskListener = isTaskListener;
      let _this = this.$refs.FlowListener;
      if (isTaskListener) {
        _this = this.$refs.FlowTaskListener;
      }
      _this.form = {
        ...data
      };
      _this.dialog = true;
    },
    listenerDel(val, isTaskListener) {
      this.isTaskListener = isTaskListener;
      let idx;
      let type;
      const element = this.rootElement ? this.rootElement : this.element;
      const bo = element.businessObject;
      // 执行监听器
      if (!isTaskListener) {
        idx = this.listenerData.indexOf(val);
        this.listenerData.splice(idx, 1);
        type = "flowable:ExecutionListener";
      } else {
        idx = this.taskListenerData.indexOf(val);
        this.taskListenerData.splice(idx, 1);
        type = "flowable:TaskListener";
      }
      this.executeCommand(this.removeExtensionElement(element, bo, type, idx));
    },
    addButton() {
      const _this = this.$refs.FlowButton;
      _this.multipleSelection = this.buttonsData;
      this.buttonsData.forEach(row => {
        _this.$refs.multipleTable.toggleRowSelection(row);
      });
      _this.dialog = true;
    },
    handleButtonCallback(datas) {
      this.buttonsData = datas;
      const bpmnFactory = this.modeler.get("bpmnFactory");
      const element = this.rootElement ? this.rootElement : this.element;
      const bo = element.businessObject;
      let extensionElements = bo.extensionElements;
      if (!extensionElements) {
        extensionElements = elementHelper.createElement(
          "bpmn:ExtensionElements",
          { values: [] },
          bo,
          bpmnFactory
        );
        this.executeCommand(
          cmdHelper.updateBusinessObject(element, bo, {
            extensionElements: extensionElements
          })
        );
      }
      const newElems = [];
      for (let i = 0; i < this.buttonsData.length; i++) {
        const button = this.buttonsData[i];
        const props = {
          name: button.name,
          code: button.action
        };
        const newElem = elementHelper.createElement(
          "flowable:Button",
          props,
          extensionElements,
          bpmnFactory
        );
        newElems.push(newElem);
      }
      this.executeCommand(
        cmdHelper.addElementsTolist(
          element,
          extensionElements,
          "values",
          newElems
        )
      );
    },
    removeButton(data) {
      const idx = this.buttonsData.indexOf(data);
      const type = "flowable:Button";
      this.buttonsData.splice(idx, 1);
      const element = this.rootElement ? this.rootElement : this.element;
      const bo = element.businessObject;
      this.executeCommand(this.removeExtensionElement(element, bo, type, idx));
    },
    checkList() {
      console.log("成功");
    },
    handleSelectForm() {
      console.log("success");
    },
    // 更改处理方式
    handleChangeModel(value) {
      this.updateProperties({ handleMode: value });
    },
    updateFlow(value) {
      const { businessObject } = this.element;
      const moddle = this.modeler.get("moddle");
      if (
        businessObject.$type === "bpmn:SequenceFlow" &&
        !businessObject.conditionExpression
      ) {
        businessObject.conditionExpression = moddle.create(
          "bpmn:FormalExpression",
          { body: value }
        );
      } else if (businessObject.conditionExpression) {
        businessObject.conditionExpression.body = value;
      }
      this.updateProperties({ condition: value });
    },
    handleChangeOperation(type) {
      let value = JSON.parse(JSON.stringify(this.operation[type]));
      console.log(value);

      console.log(Array.isArray(value));

      let properties = {};
      properties[type] = value;
      this.updateProperties(properties);
    },
    handelChangeUser(e, type) {
      this.updateProperties({ [type]: e });
    },
    handleChangeMessage(e) {
      console.log(this.operation.messageTip, "message");
      this.updateProperties({ messageTip: e });
      console.log(e);
    }
  }
};
</script>

<style >
.panel-title {
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
.box-card {
  width: 250px;
  height: 100px;
  position: relative;
  border: 1px solid #dcdfe6;
}
.el-card.is-always-shadow,
.el-card.is-hover-shadow:focus,
.el-card.is-hover-shadow:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0) !important;
}
.el-card__body {
  padding: 10px !important;
}
.choose-user {
  position: absolute;
  bottom: 0;
  right: 0;
}
.user-tag {
  margin-right: 8px;
}
</style>
