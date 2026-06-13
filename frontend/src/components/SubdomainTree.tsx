import { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import type { SubdomainEntry } from '../utils/types'

interface Props {
    domain: string
    subdomains: SubdomainEntry[]
}

interface TreeNode {
    name: string
    children?: TreeNode[]
}

function buildTree(domain: string, subdomains: SubdomainEntry[]): TreeNode {
    const root: TreeNode = { name: domain, children: [] }
    const map: Record<string, TreeNode> = { [domain]: root }

    // Sort so parent nodes are created before children
    const sorted = [...subdomains]
        .map((s) => s.subdomain)
        .filter((s) => s !== domain)
        .sort((a, b) => a.split('.').length - b.split('.').length)

    for (const sub of sorted) {
        const parts = sub.split('.')
        // Find closest existing parent
        for (let i = 1; i < parts.length; i++) {
            const parentKey = parts.slice(i).join('.')
            if (map[parentKey]) {
                const node: TreeNode = { name: sub, children: [] }
                map[sub] = node
                if (!map[parentKey].children) map[parentKey].children = []
                map[parentKey].children!.push(node)
                break
            }
        }
        // If no parent found, attach to root
        if (!map[sub]) {
            const node: TreeNode = { name: sub, children: [] }
            map[sub] = node
            root.children!.push(node)
        }
    }

    // Remove empty children arrays
    const clean = (n: TreeNode): TreeNode => ({
        ...n,
        children: n.children && n.children.length > 0 ? n.children.map(clean) : undefined,
    })

    return clean(root)
}

export function SubdomainTree({ domain, subdomains }: Props) {
    const svgRef = useRef<SVGSVGElement>(null)

    useEffect(() => {
        if (!svgRef.current || subdomains.length === 0) return

        const el = svgRef.current
        d3.select(el).selectAll('*').remove()

        const treeData = buildTree(domain, subdomains)
        const root = d3.hierarchy(treeData)

        const nodeCount = root.descendants().length
        const nodeHeight = 28
        const height = Math.max(400, nodeCount * nodeHeight)
        const width = el.parentElement?.clientWidth ?? 800
        const margin = { top: 20, right: 180, bottom: 20, left: 180 }

        const treeLayout = d3.tree<TreeNode>()
            .size([height - margin.top - margin.bottom, width - margin.left - margin.right])

        treeLayout(root)

        const svg = d3.select(el)
            .attr('width', width)
            .attr('height', height)

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`)

        // Links
        g.selectAll('.link')
            .data(root.links())
            .join('path')
            .attr('class', 'link')
            .attr('fill', 'none')
            .attr('stroke', '#1e3a4a')
            .attr('stroke-width', 1.5)
            .attr('d', d3.linkHorizontal<d3.HierarchyPointLink<TreeNode>, d3.HierarchyPointNode<TreeNode>>()
                .x((d) => d.y)
                .y((d) => d.x) as never
            )

        // Nodes
        const node = g.selectAll('.node')
            .data(root.descendants())
            .join('g')
            .attr('class', 'node')
            .attr('transform', (d) => `translate(${d.y},${d.x})`)

        // Circle
        node.append('circle')
            .attr('r', (d) => d.depth === 0 ? 6 : 4)
            .attr('fill', (d) => d.depth === 0 ? '#22d3ee' : d.children ? '#0e7490' : '#164e63')
            .attr('stroke', (d) => d.depth === 0 ? '#22d3ee' : '#0e7490')
            .attr('stroke-width', 1.5)

        // Labels
        node.append('text')
            .attr('dy', '0.32em')
            .attr('x', (d) => d.children ? -10 : 10)
            .attr('text-anchor', (d) => d.children ? 'end' : 'start')
            .attr('fill', (d) => d.depth === 0 ? '#22d3ee' : '#94a3b8')
            .attr('font-size', '11px')
            .attr('font-family', 'ui-monospace, monospace')
            .text((d) => {
                // Show only the leftmost label part for non-root nodes
                if (d.depth === 0) return d.data.name
                const parts = d.data.name.split('.')
                return parts[0]
            })
            .append('title')
            .text((d) => d.data.name) // full name on hover

    }, [domain, subdomains])

    if (subdomains.length === 0) {
        return (
            <div className="text-center py-12 text-slate-500 text-sm font-mono">
                No subdomains to visualize.
            </div>
        )
    }

    return (
        <div className="w-full overflow-x-auto rounded-lg bg-navy-900/50 border border-navy-700 p-2">
            <p className="text-xs text-slate-600 font-mono px-2 pb-2">
                Showing {subdomains.length} subdomains — hover nodes for full name
            </p>
            <svg ref={svgRef} className="block" />
        </div>
    )
}