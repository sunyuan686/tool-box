import type { ToolIconName } from '../components/icons/ToolIcons'

export type Tool = {
  id: string
  name: string
  description: string
  path: string
  available: boolean
  icon: ToolIconName
}

export const tools: Tool[] = [
  {
    id: 'json',
    name: 'JSON 格式化',
    description: '格式化、压缩、校验 JSON，支持排序键名与文件导入导出',
    path: '/json',
    available: true,
    icon: 'json',
  },
  {
    id: 'markdown',
    name: 'Markdown 预览',
    description: '实时预览 Markdown，支持 GFM、代码高亮与 Mermaid 图表',
    path: '/markdown',
    available: true,
    icon: 'markdown',
  },
  {
    id: 'diff',
    name: '文本合并',
    description: '三路 diff 合并，左中右对比并选择性保留差异内容',
    path: '/diff',
    available: true,
    icon: 'diff',
  },
]

export function getToolById(id: string) {
  return tools.find((tool) => tool.id === id)
}
