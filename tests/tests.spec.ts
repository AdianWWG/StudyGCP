// import * as k8s from "@pulumi/kubernetes";
// import * as pulumi from "@pulumi/pulumi";
import * as gcp from "@pulumi/gcp";
import { describe, it } from "mocha";
import { expect } from 'chai';

import { promise } from "./";
import * as infra from "../index";

describe("Subnet Infra", () => {
    const computeSubNetwork : gcp.compute.Subnetwork = infra.adianNet;

    it("Check network Name", async () => {
        const subnetName = await promise(computeSubNetwork.ipCidrRange)
        expect(subnetName).to.equal("10.2.1.0/24");
    });

    it("Check network Region", async () => {
        const subnetRegion = await promise(computeSubNetwork.region)
        expect(subnetRegion).to.equal("us-east1");
    });

});




describe("Set Private Subnet. ", () => {
    const privateSubnet : gcp.compute.Subnetwork = infra.PRIVATESub;

    it("Set Private Subnet name.", async () => {
        const CheckPriSubName = await promise(privateSubnet.name)
        expect(CheckPriSubName).to.equal("msat-private-subnet-6adf2d8");
    });


    it("Set Private Subnet ip GoogleAccess.", async () => {
        const CheckGoogleAccess = await promise(privateSubnet.privateIpGoogleAccess)
        expect(CheckGoogleAccess).to.equal(true);
    });

    it("Set Private Subnet ip.", async () => {
        const CheckgatewayAddress = await promise(privateSubnet.gatewayAddress)
        expect(CheckgatewayAddress).to.equal("172.2.0.1");
    });


});






describe("check GKE setting ", () => {
    const cluster: gcp.container.Cluster = infra.ClusterK8s;

    describe("#Cluster K8s", () => {
        it("must have at least 2 nodes", async () => {
            const nodes = await promise(cluster.initialNodeCount);
            expect(nodes).to.gte(2);
        });

        it("MachineType must e2-micro.", async () => {
            const MichineType = await promise(cluster.nodeConfig.machineType);
            expect(MichineType).to.equal("e2-micro");
        });

        it("GKE engine setting in us-east1 Region", async () => {
            const GKELocation = await promise(cluster.location);
            expect(GKELocation).to.equal("us-east1");
        });

        it("GKE Engine Name.", async () => {
            const GKEName = await promise(cluster.name);
            expect(GKEName).to.equal("name-530306d");
        });
    });
});


describe("Set VPC SETTING ", () => {
    const publicSubnet : gcp.compute.Subnetwork = infra.Cidr;
    it("Check Cidr", async () => {
        const iCidr = await promise(publicSubnet.ipCidrRange)
        expect(iCidr).to.equal("172.0.0.0/20");
    });

    const vpcRouter : gcp.compute.Router = infra.VPCRouter;
    it("Check vpc router name.", async () => {
        const router = await promise(vpcRouter.name)
        expect(router).to.equal("msat-router-5caae0d");
    });

});


describe("Set up Vpc Nat ", () => {
    const vpcNat : gcp.compute.RouterNat = infra.VPCNAT;
    it("Set router name", async () => {
        const vpcNET = await promise(vpcNat.router)
        expect(vpcNET).to.equal("msat-router-5caae0d");
    });


    it("Set router region us-east1.", async () => {
        const vpcNET = await promise(vpcNat.region)
        expect(vpcNET).to.equal("us-east1");
    });

    

    it("Set up nat ip allocate .", async () => {
        const NatAllocate = await promise(vpcNat.natIpAllocateOption)
        expect(NatAllocate).to.equal("AUTO_ONLY");
    });

    it("Set tcp Established Timeout Sec 1200.", async () => {
        const natEstablishedTimeout = await promise(vpcNat.tcpEstablishedIdleTimeoutSec)
        expect(natEstablishedTimeout).to.equal(1200);
    });

    it("Set tcp Transitory Idle Timeout Sec 30.", async () => {
        const natTransitoryTimeout = await promise(vpcNat.tcpTransitoryIdleTimeoutSec)
        expect(natTransitoryTimeout).to.equal(30);
    });

    it("Set udp Idle Timeout Sec 30.", async () => {
        const natUdpTimeout = await promise(vpcNat.udpIdleTimeoutSec)
        expect(natUdpTimeout).to.equal(30);
    });
    
});



describe("Set Firwall", () => {
    const publicAllowAllInbound : gcp.compute.Firewall = infra.PUBLICInBound;
    it("Set Allow All Inbound.", async () => {
        const AllowAllPublicInbound = await promise(publicAllowAllInbound.sourceRanges![0])
        expect(AllowAllPublicInbound).to.equal('0.0.0.0/0');
    });

    

});




