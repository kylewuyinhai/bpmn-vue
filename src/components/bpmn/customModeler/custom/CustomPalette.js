// CustomPalette.js
import { customShapeAction, customFlowAction, batchCreateCustom } from './confjg/palette.config'
/**
 * A palette provider for BPMN 2.0 elements.
 */
export default function PaletteProvider(
    palette, create, elementFactory,
    spaceTool, lassoTool, handTool,
    globalConnect, translate) {
    this.palette = palette
    this.create = create
    this.elementFactory = elementFactory
    this.spaceTool = spaceTool
    this.lassoTool = lassoTool
    this.handTool = handTool
    this.globalConnect = globalConnect
    this.translate = translate

    palette.registerProvider(this)
}

PaletteProvider.$inject = [
    'palette',
    'create',
    'elementFactory',
    'spaceTool',
    'lassoTool',
    'handTool',
    'globalConnect',
    'translate'
]
PaletteProvider.prototype.getPaletteEntries = function () {
    const actions = {}
    const {
        create,
        elementFactory,
        globalConnect,
        translate
    } = this;

    function createConnect(type, group, className, title) {
        return {
            group,
            className,
            title: '新增' + title,
            action: {
                click: function (event) {
                    globalConnect.toggle(event)
                }
            }
        }
    }

    function createAction(type, group, className, title, options) {
        function createListener(event) {
            var shape = elementFactory.createShape(Object.assign({ type }, options))
            if (options) {
                shape.businessObject.di.isExpanded = options.isExpanded
            }
            create.start(event, shape)
        }
        const shortType = type.replace(/^bpmn:/, '')
        return {
            group,
            className,
            title: title || translate('Create {type}', { type: shortType }),
            action: {
                dragstart: createListener,
                click: createListener
            }
        }
    }
    Object.assign(actions, {
        ...batchCreateCustom(customFlowAction, createConnect), // 线
        ...batchCreateCustom(customShapeAction, createAction)
    })
    return actions
}