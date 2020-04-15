<template>
  <div class="v-bpmn">
    <div class="canvas" ref="canvas"></div>
    <panel class="panel" v-if="bpmnModeler" :modeler="bpmnModeler" />
    <!-- <div id="js-properties-panel" class="panel"></div> -->
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
// import propertiesPanelModule from "bpmn-js-properties-panel";
// 自定义的 properties-panel内容
// import propertiesProviderModule from "./CustomPanel/provider/authority";
// 引入描述文件
// import authorityModdleDescriptor from "./CustomPanel/descriptors/authority";
// import propertiesProviderModule from "bpmn-js-properties-panel/lib/provider/camunda";
import activitiModdleDescriptor from "./activiti.json";

// import propertiesProviderModule from 'bpmn-js-properties-panel/lib/provider/activiti'
// import activitiModdleDescriptor from "activiti-bpmn-moddle/resources/activiti";
import customTranslate from "./CustomTranslate"; //汉化引入
import customModeler from "./customModeler";
import { xmlStr } from "./mock";
import panel from "./propertyPanel";
export default {
  name: "vBpmn",
  components: {
    panel
  },
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
        propertiesPanel: {
          parent: "#js-properties-panel"
        },
        additionalModules: [
          // 左边工具栏以及节点
          // propertiesProviderModule,
          // propertiesPanelModule,
          { translate: ["value", customTranslate] }
        ],
        moddleExtensions: {
          // camunda: camundaModdleDescriptor,
          // authority: authorityModdleDescriptor
          activiti: activitiModdleDescriptor
        }
      });
      if (xmlStr) {
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
      } else {
        this.bpmnModeler.createDiagram(function(err) {
          if (err) {
            console.error(err);
          } else {
            //这里还没用到这个，先注释掉吧
            // this.success();
          }
        });
      }
    },
    success() {
      console.log("创建成功");
      this.addBpmnListener();
    },
    // 添加绑定事件
    addBpmnListener() {
      const that = this;
      // 获取a标签dom节点
      const downloadLink = this.$refs.saveDiagram;
      const downloadSvgLink = this.$refs.saveSvg;
      // 给图绑定事件，当图有发生改变就会触发这个事件
      this.bpmnModeler.on("commandStack.changed", function() {
        that.saveDiagram(function(err, xml) {
          console.log(xml);
          that.setEncoded(downloadLink, "diagram.bpmn", err ? null : xml);
        });
        that.saveSVG(function(err, svg) {
          that.setEncoded(downloadSvgLink, "diagram.svg", err ? null : svg);
        });
      });
    },
    saveDiagram(done) {
      this.bpmnModeler.saveXML({ format: true }, function(err, xml) {
        // if (!err) {
        //     FileSaver.saveAs(new Blob([xml], { type: 'application/octet-stream' }), 'diagram.bpmn')
        // }
        done(err, xml);
      });
    },
    saveSVG(done) {
      this.bpmnModeler.saveSVG(done);
    },
    setEncoded(link, name, data) {
      // 把xml转换为URI，下载要用到的
      const encodedData = encodeURIComponent(data);
      // 下载图的具体操作,改变a的属性，className令a标签可点击，href令能下载，download是下载的文件的名字
      //   console.log(link, name, data)
      let xmlFile = new File([data], "test.bpmn");
      console.log(xmlFile);
      if (data) {
        link.className = "active";
        link.href = "data:application/bpmn20-xml;charset=UTF-8," + encodedData;
        link.download = name;
      }
    }
  }
};
</script>

<style>
.djs-palette {
  top: 50% !important;
  transform: translateY(-50%);
  width: 80px !important;
  text-align: center;
}
.djs-palette .entry,
.djs-palette .djs-palette-toggle {
  width: 80px !important;
  height: 80px !important;
  font-size: 40px !important;
  line-height: 50px !important;
}
.v-bpmn {
  background-color: #ffffff;
  position: absolute;
  background: white;
  background-image: linear-gradient(
      90deg,
      rgba(220, 220, 220, 0.5) 6%,
      transparent 0
    ),
    linear-gradient(rgba(192, 192, 192, 0.5) 6%, transparent 0),
    linear-gradient(rgba(192, 192, 192, 0.5) 1px, transparent 0),
    linear-gradient(90deg, rgba(192, 192, 192, 0.5) 1px, transparent 0);
  background-size: 15px 15px, 15px 15px, 75px 75px, 75px 75px;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
}
.canvas {
  width: 100%;
  height: 100%;
}
.panel {
  position: absolute;
  right: 0;
  top: 0;
  width: 400px;
  height: 100%;
  border: 1px solid #f3f3f3;
  box-sizing: border-box;
  background: #fff;
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