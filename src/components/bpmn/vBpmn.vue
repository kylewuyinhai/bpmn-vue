<template>
  <div class="v-bpmn">
    <div class="canvas" ref="canvas"></div>
    <div id="js-properties-panel" class="panel"></div>
    <ul class="buttons">
      <li>
        <a ref="saveDiagram" href="javascript:" title="保存为bpmn">保存为bpmn</a>
      </li>
      <li>
        <a ref="saveSvg" href="javascript:" title="保存为svg">保存为svg</a>
      </li>
    </ul>
  </div>
</template>

<script>
// import BpmnModeler from "bpmn-js/lib/Modeler";
import propertiesPanelModule from "bpmn-js-properties-panel";
// 自定义的 properties-panel内容
import propertiesProviderModule from "./CustomPanel/provider/authority";
// 引入描述文件
import authorityModdleDescriptor from "./CustomPanel/descriptors/authority";
// import propertiesProviderModule from "bpmn-js-properties-panel/lib/provider/camunda";
import customTranslate from "./CustomTranslate"; //汉化引入
import customModeler from "./customModeler";
import { xmlStr } from "./mock";
export default {
  name: "vBpmn",
  data() {
    return {
      bpmnModeler: null,
      container: null,
      canvas: null,
      defaultXmlStr: xmlStr
    };
  },
  created() {},
  mounted() {
    this.initBpmn();
  },
  methods: {
    initBpmn() {
      const canvas = this.$refs.canvas;
      this.bpmnModeler = new customModeler({
        container: canvas,
        //添加控制板
        propertiesPanel: {
          parent: "#js-properties-panel"
        },
        //汉化

        additionalModules: [
          // 左边工具栏以及节点
          propertiesProviderModule,
          propertiesPanelModule,
          { translate: ["value", customTranslate] }
        ],
        moddleExtensions: {
          // camunda: camundaModdleDescriptor,
          authority: authorityModdleDescriptor
        }
      });
      this.bpmnModeler.importXML(xmlStr, err => {
        if (err) {
          console.error(err);
        } else {
          this.success();
        }
        // 让图能自适应屏幕
        var canvas = this.bpmnModeler.get("canvas");
        canvas.zoom("fit-viewport");
      });
    },
    success() {
      console.log("创建成功");
    }
  }
};
</script>

<style>
.v-bpmn {
  background-color: #ffffff;
  width: 100%;
  height: calc(100vh - 52px);
}
.canvas {
  width: 100%;
  height: 100%;
}
.panel {
  position: absolute;
  right: 0;
  top: 0;
  width: 300px;
}
.buttons {
  position: absolute;
  left: 20px;
  bottom: 20px;
}
.buttons li {
  display: inline-block;
  margin: 5px;
}
.buttons li a {
  color: #999;
  background: #eee;
  cursor: not-allowed;
  padding: 8px;
  border: 1px solid #ccc;
  text-decoration: none;
}
.buttons li a.active {
  color: #333;
  background: #fff;
  cursor: pointer;
}
.bjs-powered-by {
  display: none;
}
</style>