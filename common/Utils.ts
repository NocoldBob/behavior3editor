import { TreeGraphData } from "@antv/g6/lib/types"
import { BehaviorNodeModel, BehaviorTreeModel, GraphNodeModel } from "./BehaviorTreeModel";
import Settings from "../main-process/Settings";
import { remote } from "electron";
import * as path from 'path';

export const cloneNodeData = (nodeData: GraphNodeModel) => {
  const newData: GraphNodeModel = {
    id: nodeData.id + "new",
    name: nodeData.name,
    conf: nodeData.conf,
  }
  return newData;
}

export const refreshNodeId = (nodeData: GraphNodeModel, id?: number) => {
  if (!id) {
    id = 1;
  }
  nodeData.id = (id++).toString();
  if (nodeData.children) {
    nodeData.children.forEach(child => {
      id = refreshNodeId(child, id);
    })
  }
  return id;
}

export const calcTreeNodeSize = (treeNode: GraphNodeModel) => {
  var height = 40;
  const updateHeight = (obj: any) => {
    if (Array.isArray(obj) || (obj && Object.keys(obj).length > 0)) {
      height += 25;
    }
  }
  updateHeight(treeNode.conf.args);
  updateHeight(treeNode.conf.input);
  updateHeight(treeNode.conf.output);
  return [200, height];
}

export const createTreeData = (bNode: BehaviorNodeModel, settings: Settings) => {
  const treeData: GraphNodeModel = {
    id: bNode.id.toString(),
    name: bNode.name,
    desc: bNode.desc,
    args: bNode.args,
    input: bNode.input,
    output: bNode.output,
    conf: settings.getNodeConf(bNode.name),
  }
  treeData.size = calcTreeNodeSize(treeData);
  if (bNode.children) {
    treeData.children = [];
    bNode.children.forEach(child => {
      treeData.children.push(createTreeData(child, settings));
    })
  }
  calcTreeNodeSize(treeData);
  return treeData;
}

export const createFileData = (gNode: GraphNodeModel) => {
  const nodeData: BehaviorNodeModel = {
    id: Number(gNode.id),
    name: gNode.name,
    desc: gNode.desc || undefined,
    args: gNode.args || undefined,
    input: gNode.input || undefined,
    output: gNode.output || undefined,
  }
  if (gNode.children) {
    nodeData.children = [];
    gNode.children.forEach(child => {
      nodeData.children.push(createFileData(child));
    })
  }
  return nodeData;
}

export const findParent = (node: TreeGraphData, id: string): TreeGraphData | null => {
  if (node.children) {
    for (let child of node.children) {
      if (child.id == id) {
        return node;
      } else {
        let parent = findParent(child, id);
        if (parent) {
          return parent;
        }
      }

    }
  }
  return null;
}

export const findFromAllChildren = (node: TreeGraphData, id: string): TreeGraphData | null => {
  if (node.id == id) {
    return node;
  }
  if (node.children) {
    for (let child of node.children) {
      let found = findFromAllChildren(child, id);
      if (found) {
        return found;
      }
    }
  }
  return null;
}

export const getRemoteSettings = () => {
  return remote.getGlobal("settings") as Settings;
}

export const fileName2treeName = (filename: string) => {
  return path.basename(filename).slice(0, -5);
}

export const createNewTree = (filename: string) => {
  const tree: BehaviorTreeModel = {
    name: fileName2treeName(filename),
    root: {
      id: 1,
      name: 'Sequence',
      desc: '新建行为树'
    }
  }
  return tree;
}