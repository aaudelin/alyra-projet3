"use client";

import Role from "@/components/Role";
import ContractInfos from "@/components/ContractInfos";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useBlockNumber,
} from "wagmi";
import { contract } from "@/app/contract";
import '@/app/styles.css'

import { useEffect } from "react";
import AddVoter from "./AddVoter";
import AddProposal from "./AddProposal";
import Vote from "./Vote";
import NextStep from "./NextStep";
import Status from "./Status";
import Events from "./Events";

const WorkflowStatus: Record<string, string> = {
  "0": "Registering voters",
  "1": "Proposals registration",
  "2": "Proposals registration ended",
  "3": "Voting session started",
  "4": "Voting session ended",
  "5": "Votes Tallied",
  "99": "Unknown",
};

const Bank = () => {

function labelVoter(address?: `0x${string}`, owner?: any, voter?: any) {
  if (address === owner) {
    return "Owner";
  }
  if (voter?.isRegistered) {
    return "Voter";
  }
  return "Unknown";
}

  const { data: hash, isPending, writeContract } = useWriteContract();
  const { data: blockNumber } = useBlockNumber({ watch: true });

  const { address, isConnected } = useAccount();

  const { data: workflowStatus, refetch: refetchWorkflowStatus } =
    useReadContract({
      abi: contract.abi,
      address: contract.address,
      functionName: "workflowStatus",
      args: [],
    });

  const { data: owner } = useReadContract({
    abi: contract.abi,
    address: contract.address,
    functionName: "owner",
    args: [],
  });

  const { data: voter, refetch: refetchVoter } = useReadContract({
    abi: contract.abi,
    address: contract.address,
    functionName: "getVoter",
    args: [address],
    account: address,
  });

  const { data: winner, refetch: refetchWinner } = useReadContract({
    abi: contract.abi,
    address: contract.address,
    functionName: "winningProposalID",
    args: [],
  });

  useEffect(() => {
    refetchWorkflowStatus();
    refetchVoter();
    refetchWinner();
  }, [blockNumber]);

  return (
    <div className="container-main">
      <Role isConnected={isConnected} labelVoter={labelVoter(address, owner, voter)}/>
      <ContractInfos owner={owner} workflowStatus={WorkflowStatus[workflowStatus?.toString() ?? "99"]} />
      <NextStep owner={owner} workflowStatus={workflowStatus}/>
      <Status voter={voter} winner={winner} workflowStatus={workflowStatus}/>
      <AddVoter owner={owner} workflowStatus={workflowStatus} address={address}/>
      <AddProposal voter={voter} workflowStatus={workflowStatus} />
      <Vote voter={voter} workflowStatus={workflowStatus}/>
      <Events />
  </div>);
}

export default Bank;