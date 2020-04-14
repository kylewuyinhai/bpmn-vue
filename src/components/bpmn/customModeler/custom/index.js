
import CustomPalette from './CustomPalette'
import CustomRenderer from './CustomRenderer'
import CustomContextPadProvider from './CustomContextPadProvider'


export default {
    __init__: ['paletteProvider', 'contextPadProvider','customRenderer'],
    paletteProvider: ['type', CustomPalette],
    contextPadProvider: ['type', CustomContextPadProvider],
    customRenderer: ['type', CustomRenderer]
}
