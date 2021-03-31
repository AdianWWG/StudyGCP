import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import "mocha";
import { expect } from "chai";
import { filter } from "lodash";
import { Subnetwork } from "@pulumi/gcp/compute";
import { describe, it } from "mocha";
import * as k8s from "@pulumi/kubernetes";

import { runTests } from "./tests";
const name = "AdianGKE";
const config = new pulumi.Config();
const project = config.require("project");
const namePrefix = config.require("name_prefix");
const region = config.require("region")
//////////
const initialNodes = 2;
//gke cluster
///////////////////////////////////

export const clusterNodeMachineType = config.get("clusterNodeMachineType") || "e2-micro";
const cluster = new gcp.container.Cluster("name", {
    initialNodeCount: initialNodes,
    nodeVersion: "latest",
    minMasterVersion: "latest",
    location: region,
    nodeConfig: {
        machineType: clusterNodeMachineType,
        oauthScopes: [
            "https://www.googleapis.com/auth/compute",
            "https://www.googleapis.com/auth/devstorage.read_only",
            "https://www.googleapis.com/auth/logging.write",
            "https://www.googleapis.com/auth/monitoring"
        ],
    },
});
export const ClusterK8s = cluster

//////////

const computeNetwork = new gcp.compute.Network('tsk8snet', {
    project: project,
    autoCreateSubnetworks: false
});
export const customNet = computeNetwork;


const computeSubNetwork = new gcp.compute.Subnetwork('tsk8ssubnet', {
    ipCidrRange: '10.2.1.0/24',
    network: computeNetwork.selfLink,
    region: region,
    project: project
});
export const adianNet = computeSubNetwork;




///////////////////////////////////
// Create a GCP resource (Storage Bucket)
const vpc = new gcp.compute.Network(`${namePrefix}-vpc`, {
    autoCreateSubnetworks: false,
    project: project,
    routingMode: "REGIONAL",
})
export const VPC = vpc;


const publicSubnet = new gcp.compute.Subnetwork(`${namePrefix}-public-subnet`, {
    ipCidrRange: "172.0.0.0/20",
    network: vpc.selfLink,
    region: region,
    project: project,
    privateIpGoogleAccess: true,
})
export const Cidr = publicSubnet;



const vpcRouter = new gcp.compute.Router(`${namePrefix}-router`, {
    name:"msat-router-5caae0d",
    network: vpc.selfLink,
    project: project,
    region: region,
})
export const VPCRouter = vpcRouter;


const privateSubnet = new gcp.compute.Subnetwork(`${namePrefix}-private-subnet`, {
    ipCidrRange: "172.2.0.0/20",
    network: vpc.selfLink,
    region: region,
    project: project,
    privateIpGoogleAccess: true,
})
export const PRIVATESub = privateSubnet;


const vpcNat = new gcp.compute.RouterNat(`${namePrefix}-nat`, {
    project: project,
    region: region,
    router: vpcRouter.name,
    natIpAllocateOption: "AUTO_ONLY",

    sourceSubnetworkIpRangesToNat: "LIST_OF_SUBNETWORKS",
    subnetworks: [{
        name: publicSubnet.selfLink,
        sourceIpRangesToNats: ["ALL_IP_RANGES"],
    }],
})
export const VPCNAT = vpcNat;


const publicAllowAllInbound = new gcp.compute.Firewall(`${namePrefix}-public-allow-ingress`, {
    project: project,
    network: vpc.selfLink,
    targetTags: ["public"],
    direction: "INGRESS",
    sourceRanges: ["0.0.0.0/0"],

    allows: [{
        protocol: "all",
    }]
})
export const PUBLICInBound = publicAllowAllInbound;



const privateAllowAllNetworkInbound = new gcp.compute.Firewall(namePrefix + "-private-allow-ingress", {
    project: project,
    network: vpc.selfLink,
    targetTags: ["private"],
    direction: "INGRESS",
    sourceRanges: [
        privateSubnet.ipCidrRange,
        publicSubnet.ipCidrRange
    ],
    allows: [{
        protocol: "all",
    }]
});

runTests();