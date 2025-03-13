import { BestFit } from "./BestFit.js";
import { Open } from "./Open.js";
import { RemoveAllSelectedPoints } from "./RemoveAllSelectedPoints.js";
import { Roots } from "./Roots.js";
import { Tangents } from "./Tangents.js";
import { AddPoint } from "./AddPoint.js";
import { Differentiate } from "./Differentiate.js";
import { LineSegment } from "./LineSegment.js";

export class CommandSelector {

    /** @type {Graph}*/graph

    constructor(graph) {
        this.graph = graph;
    }

    GetCommand(commandString) {

        
        let commandCalls = {
            "Best Fit" : () => {
                return new BestFit(this.graph);
            },

            "Remove All" : () => {
                return new RemoveAllSelectedPoints(this.graph);
            },

            "Get Tangents" : () => {
                return new Tangents(this.graph);
            },

            "Roots" : () => {
                return new Roots(this.graph);
            },

            "Open" : () => {
                return new Open(this.graph);
            },

            "Add Point" : () => {
                return new AddPoint(this.graph);
            },

            "Differentiate" : () => {
                return new Differentiate(this.graph);
            },

            "Line Segment": () => {
                return new LineSegment(this.graph);
            }
        }

        return commandCalls[commandString]();
            
    }

}