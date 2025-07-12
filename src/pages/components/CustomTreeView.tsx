import { SimpleTreeView, TreeItem } from '@mui/x-tree-view'
import { ExpandMore, ChevronRight } from '@mui/icons-material'

interface BaseTreeNode {
  id: string
  name: string
}

// Generic TreeNode interface with additional properties
interface TreeNode<T extends BaseTreeNode> extends BaseTreeNode {
  children?: TreeNode<T>[]
  // You can now include additional properties from T
}

// Generic CustomTreeViewProps interface
interface CustomTreeViewProps<T> {
  data: T
  name: string
  id: string
}

const isPrimitive = (value: unknown) => value !== Object(value) || value === null
// A utility function to transform any object into a TreeNode structure
const objectToTreeNode = <T extends Record<string, unknown>>(
  obj: T,
  key: string = 'root',
  nodeId: string = '0',
): TreeNode<BaseTreeNode> => {
  const children = Object.keys(obj).map((k, index) => {
    const value = obj[k]
    if (isPrimitive(value)) {
      // Handle primitive types directly
      return {
        id: `${nodeId}-${index}`,
        name: `${k}: ${String(value)}`,
      }
    } else if (Array.isArray(value)) {
      // If it's an array, create a node that lists all elements
      return {
        id: `${nodeId}-${index}`,
        name: k,
        children: value.map((item, itemIndex) => {
          // Handle primitive items in the array directly
          if (isPrimitive(item)) {
            return {
              id: `${nodeId}-${index}-${itemIndex}`,
              name: `${item}`,
            }
          }
          // Recursively handle objects in the array
          return objectToTreeNode(item, k, `${nodeId}-${index}-${itemIndex}`)
        }),
      }
    } else {
      // Recursively handle objects
      return objectToTreeNode(value as Record<string, unknown>, k, `${nodeId}-${index}`)
    }
  })

  return {
    id: nodeId,
    name: (obj.name || key) as string,
    children: children.length ? children : undefined,
  }
}

// Render tree function utilizing the TreeNode interface
const renderTree = <T extends BaseTreeNode>(nodes: TreeNode<T>) => (
  <TreeItem key={nodes.id} itemId={nodes.id} label={nodes.name}>
    {nodes.children?.map((node) => renderTree(node))}
  </TreeItem>
)

// CustomTreeView component using TypeScript
const CustomTreeView = <T,>({ data, name, id }: CustomTreeViewProps<T>) => {
  const dataAsTreeNode = objectToTreeNode({ id, name, children: [data] })
  return (
    <SimpleTreeView
      slots={{
        collapseIcon: ExpandMore,
        expandIcon: ChevronRight,
        endIcon: () => <div style={{ width: 24 }} />,
      }}>
      {renderTree(dataAsTreeNode)}
    </SimpleTreeView>
  )
}

export default CustomTreeView
