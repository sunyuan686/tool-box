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
]

export function getToolById(id: string) {
  return tools.find((tool) => tool.id === id)
}
