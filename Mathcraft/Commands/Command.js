import { Graph } from "../Graph.js";

export class Command {

    /** @type {Graph}*/graph;

    constructor(graph) {
        this.graph = graph;
        this.renderer = this.graph.renderer;
    }

    Run() {
        throw new Error("Run() must be implemented by subclass");
    }

    OnComplete() {
        console.log("A command has been finished");
        this.graph.DeselectSelectedEntities();
    }
}