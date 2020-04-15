<template>
  <div v-if="!rootElement&&element" ref="propertyPanel" class="property-panel">
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
                @change="updateName"
              />
            </el-form-item>
            <el-form-item label="处理方式" v-if="!isStart">
              <el-radio-group v-model="form.handleType" @change="handleChangeModel">
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
          <el-form :model="form" label-width="100px" size="small">
            <el-form-item :label="isStart ? '发起人类型' : '执行人类型'">
              <el-select
                v-model="form.assigneeType"
                placeholder="请选择"
                @change="handelChangeUser($event,'assigneeType')"
              >
                <el-option label="指定执行人" :value="1"></el-option>
                <el-option label="指定角色" :value="2"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="isStart ? '选择发起人' : '选择执行人'">
              <el-input
                type="text"
                v-model="form.assignee"
                @change="handelChangeUser($event,'assignee')"
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
          <el-form :model="form" label-width="100px" size="small">
            <el-form-item v-if="hasSelectForm" label="选择表单">
              <el-input
                v-model="form.formId"
                clearable
                class="el_input"
                @change="handleChangeOperation('formId')"
              >
                <el-button
                  slot="append"
                  icon="el-icon-more"
                  @click="handleChangeOperation('formId')"
                />
              </el-input>
            </el-form-item>
            <el-form-item v-if="!isStart" label="回退方式">
              <el-radio-group v-model="form.backType" @change="handleChangeOperation('backType')">
                <el-radio :label="1">上一步</el-radio>
                <el-radio :label="2">发起人</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="不满足条件时" v-show="!(isStart||isEnd)">
              <el-radio-group v-model="form.misMatch" @change="handleChangeOperation('misMatch')">
                <el-radio :label="1">结束流程</el-radio>
                <el-radio :label="2">退回发始人</el-radio>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="消息提醒">
              <el-checkbox-group
                v-model="form.noticeType"
                @change="handleChangeOperation('noticeType')"
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
              <el-input
                v-model="flow.condition"
                placeholder
                @change="updateFlow($event, 'condition')"
              ></el-input>
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
                v-model="flow.test"
                clearable
                placeholder="请输入名称"
                class="el_input"
                @change="updateFlow($event, 'test')"
              />
              <el-select v-model="flow.test" placeholder>
                <el-option
                  v-for="item in options"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-form>
        </el-collapse-item>
      </template>
    </el-collapse>
  </div>
</template>

<script>
export default {
  name: "PropertyPanel",
  components: {},
  props: {
    modeler: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      options: [
        {
          value: "选项1",
          label: "黄金糕"
        },
        {
          value: "选项2",
          label: "双皮奶"
        }
      ],
      //多选元素
      selectedElements: [],
      //当前点击元素
      element: {},
      //根元素
      rootElement: null,
      activeName: ["1", "2", "3"],
      //面板表单
      form: {
        assigneeType: 1,
        assignee: "",
        backType: 1,
        misMatch: 1,
        noticeType: [1],
        formId: "",
        name: "",
        handleType: 1
      },
      // 箭头条件表单
      flow: {
        condition: "",
        transferData: {},
        test: ""
      }
    };
  },
  computed: {
    //是否是开始任务
    isStart() {
      // if (!this.element) {
      //   return;
      // }
      return this.element.type === "bpmn:StartEvent";
    },
    //是否是结束任务
    isEnd() {
      if (!this.element) {
        return;
      }
      return this.element.type === "bpmn:EndEvent";
    },
    //是否是发送任务
    isSendTask() {
      if (!this.element) {
        return;
      }
      return this.element.type === "bpmn:SendTask";
    },
    //是否是转填任务
    isBusinessTask() {
      if (!this.element) {
        return;
      }
      return this.element.type === "bpmn:BusinessRuleTask";
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
    //是否是普通任务
    isUserTask() {
      if (!this.element) {
        return;
      }
      return this.element.type === "bpmn:UserTask";
    },
    //是否是箭头
    sequenceFlow() {
      if (!this.element) {
        return;
      }
      return this.element.type === "bpmn:SequenceFlow";
    },
    //是否为转填任务前的箭头
    isSequenceFlowToRule() {
      if (!this.element) {
        return;
      }
      return (
        this.element.type === "bpmn:SequenceFlow" &&
        this.element.target.type === "bpmn:BusinessRuleTask"
      );
    }
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.modeler.on("shape.added", e => {
        this.element = e.element;
        console.log(e, "addd");
        this.$nextTick(() => {
          this.element && this.setDefaultPropertiesFirst(this.element.type);
        }, 0);
      });
      this.modeler.on("connect.end", e => {
        console.log(e,'==========================================');
      });
      this.modeler.on("selection.changed", e => {
        console.log("selection change");
        this.selectedElements = e.newSelection;
        this.element = e.newSelection[0];
        this.rootElement = null;
        this.$nextTick(() => {
          this.setDefaultProperties(this.element);
        });
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
        // this.setDefaultProperties(this.element);
        if (!this.element) {
          this.rootElement = e.element;
          this.setDefaultProperties(this.element);
        }
      });
    },
    setDefaultProperties(element) {
      console.log(element, "serDefaule");
      if (element && element.type !== "bpmn:Process") {
        const { businessObject } = element;
        if (element.type === "bpmn:SequenceFlow") {
          this.flow = {
            ...businessObject,
            ...businessObject.$attrs
          };
          return;
        }
        this.form = {
          ...businessObject,
          ...businessObject.$attrs
        };
      }
    },
    setDefaultPropertiesFirst(type) {
      const propertiesMap = {
        "bpmn:StartEvent": {
          // name: "开始任务",
          assigneeType: 2,
          assignee: "",
          formId: "",
          noticeType: [2, 3]
        },
        "bpmn:EndEvent": {
          handleType: 2,
          assigneeType: 2,
          assignee: "",
          backType: 2,
          noticeType: [2, 3]
        },
        "bpmn:UserTask": {
          handleType: 2,
          assigneeType: 2,
          assignee: "",
          backType: 2,
          noticeType: [2, 3],
          misMatch: 1
        },
        "bpmn:SendTask": {
          assigneeType: 2,
          assignee: ""
        },
        "bpmn:BusinessRuleTask": {
          handleType: 2,
          assigneeType: 2,
          assignee: "",
          backType: 2,
          noticeType: [2, 3],
          misMatch: 1,
          formId: ""
        },
        "bpmn:SequenceFlow": {
          condition: "",
          transferData: {},
          test: ""
        }
      };
      this.updateProperties(propertiesMap[type] || {});
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
    updatePropertiesOnce(properties) {
      const modeling = this.modeler.get("modeling");
      modeling.updateProperties(
        this.element ? this.element : this.rootElement,
        properties
      );
      return Object.values(properties)[0];
    },
    // 更改处理方式
    handleChangeModel(value) {
      this.updateProperties({ handleType: value });
    },
    updateFlow(value, type) {
      const { businessObject } = this.element;
      const moddle = this.modeler.get("moddle");
      if (
        businessObject.$type === "bpmn:SequenceFlow" &&
        !businessObject.conditionExpression &&
        type === "condition"
      ) {
        businessObject.conditionExpression = moddle.create(
          "bpmn:FormalExpression",
          { body: value }
        );
      } else if (businessObject.conditionExpression && type === "condition") {
        businessObject.conditionExpression.body = value;
      }
      this.updateProperties({ type: value });
    },
    handleChangeOperation(type) {
      let value = JSON.parse(JSON.stringify(this.form[type]));
      let properties = {};
      properties[type] = value;
      this.updateProperties(properties);
    },
    handelChangeUser(e, type) {
      this.updateProperties({ [type]: e });
    },
    handleChangeMessage(e) {
      this.updateProperties({ messageTip: e });
    }
  }
};
</script>

<style >
.djs-visual text tspan {
  font-size: 18px;
  text-align: left;
}
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
