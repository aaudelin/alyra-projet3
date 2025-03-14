"use client";

import Role from "@/components/Role";
import ContractInfos from "@/components/ContractInfos";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useBlockNumber,
} from "wagmi";
import { parseAbiItem } from 'viem'
import { contract } from "@/app/contract";
import '@/app/styles.css'
import { publicClient } from '@/app/client'

import { useEffect, useState } from "react";
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

type Proposal = {
  id: number;
  description: string | undefined;
  voteCount: number;
};

  const { data: hash, isPending, writeContract } = useWriteContract();
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const { address, isConnected } = useAccount();
  const [proposalIds, setEvents] = useState<string[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);

  const getEvents = async() => {
    const proposalEvents = await publicClient.getLogs({
      address: contract.address,
      event: parseAbiItem('event ProposalRegistered(uint256 proposalId)'),
      fromBlock: 'earliest',
      toBlock: 'latest' 
    })
    const ids = proposalEvents.map(event => event.args.proposalId?.toString() ?? '').filter(i => i.length > 0);
    setEvents(ids)
  }

  const getAllProposals = async () => {
    if(!voter?.isRegistered) return;
    const retrieveProposals = proposalIds.map(id =>
      publicClient.readContract({
        abi: contract.abi,
        address: contract.address,
        functionName: 'getOneProposal',
        args: [id],
        account: address
      })
    );
    const results = (await Promise.all(retrieveProposals)) as Proposal[];
    setProposals(results)
  };

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

  useEffect(() => {
    setProposals([]);
    const getAllEvents = async () => {
      if(!address) {
        await getEvents();
      }
    }
    getAllEvents().then(() => {
      getAllProposals();
    });
  }, [isConnected, voter]);

  return (
    <div className="container-main">
      <Role isConnected={isConnected} labelVoter={labelVoter(address, owner, voter)}/>
      <ContractInfos owner={owner} workflowStatus={WorkflowStatus[workflowStatus?.toString() ?? "99"]} />
      <NextStep owner={owner} workflowStatus={workflowStatus}/>
      <Status voter={voter} winner={winner} workflowStatus={workflowStatus}/>
      <AddVoter owner={owner} workflowStatus={workflowStatus} address={address}/>
      <AddProposal voter={voter} workflowStatus={workflowStatus} />
      <Vote voter={voter} workflowStatus={workflowStatus}/>
      {voter?.isRegistered && <Events proposals={proposals} />}
  </div>);
}

export default Bank;