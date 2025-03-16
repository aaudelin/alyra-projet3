"use client";

import Role from "@/components/Role";
import ContractInfos from "@/components/ContractInfos";
import {
  useAccount,
  useReadContract,
  useBlockNumber,
  usePublicClient,
  useChainId,
  useWatchContractEvent,
} from "wagmi";
import { parseAbiItem } from "viem";
import { contract } from "@/app/contract";
import "@/app/styles.css";

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

export interface Voter {
  isRegistered: boolean;
  hasVoted: boolean;
  votedProposalId: number;
}

export type Proposal = {
  id: number;
  description: string | undefined;
  voteCount: number;
};

const Bank = () => {
  const chainId = useChainId();

  const publicClient = usePublicClient({
    chainId: chainId,
  });

  function labelVoter(
    address?: `0x${string}`,
    owner?: `0x${string}`,
    voter?: Voter
  ) {
    if (address === owner) {
      return "Owner";
    }
    if (voter?.isRegistered) {
      return "Voter";
    }
    return "Unknown";
  }


  const { data: blockNumber } = useBlockNumber({ watch: true });
  const { address, isConnected } = useAccount();
  const [proposalIds, setEvents] = useState<string[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);

  const getEvents = async () => {
    const proposalEvents =
      (await publicClient?.getLogs({
        address: contract.address,
        event: parseAbiItem("event ProposalRegistered(uint256 proposalId)"),
        fromBlock: "earliest",
        toBlock: "latest",
      })) ?? [];
    const ids = proposalEvents
      .map((event) => event.args.proposalId?.toString() ?? "")
      .filter((i) => i.length > 0);
    setEvents(ids);
  };

  const getAllProposals = async () => {
    if (!voter?.isRegistered) return;
    console.log("Proposals");

    const proposals = [];
    try {
      for (const id of proposalIds) {
        const retrieveProposal = await publicClient?.readContract({
          abi: contract.abi,
          address: contract.address,
          functionName: "getOneProposal",
          args: [id],
          account: address,
        });
        const proposal = retrieveProposal as Proposal;
        proposal.id = parseInt(id);
        proposals.push(proposal);
      }
    } catch (error) {
      console.error("Error retrieving proposal", error);
    }
    setProposals(proposals);
  };

  const { data: workflowStatus, refetch: refetchWorkflowStatus } =
    useReadContract({
      abi: contract.abi,
      address: contract.address,
      functionName: "workflowStatus",
      args: [],
    });

  // Type assertion pour workflowStatus
  const typedWorkflowStatus = workflowStatus as bigint | undefined;

  const { data: owner } = useReadContract({
    abi: contract.abi,
    address: contract.address,
    functionName: "owner",
    args: [],
  });

  const typedOwner = owner as `0x${string}` | undefined;

  const { data: voterData, refetch: refetchVoter } = useReadContract({
    abi: contract.abi,
    address: contract.address,
    functionName: "getVoter",
    args: [address],
    account: address,
  });

  const voter = voterData as Voter | undefined;

  const { data: winner, refetch: refetchWinner } = useReadContract({
    abi: contract.abi,
    address: contract.address,
    functionName: "winningProposalID",
    args: [],
  });

  const typedWinner = winner as bigint | undefined;

  useEffect(() => {
    refetchWorkflowStatus();
    refetchVoter();
    refetchWinner();
  }, [blockNumber]);

  function refreshProposals() {
    setProposals([]);
    const getAllEvents = async () => {
      await getEvents();
    };
    getAllEvents().then(() => {
      getAllProposals();
    });
  }

  useEffect(() => {
    refreshProposals();
  }, [isConnected, voter, chainId]);

  useWatchContractEvent({
    address: contract.address,
    abi: contract.abi,
    eventName: "ProposalRegistered",
    onLogs(logs) {
      for (const log of logs) {
        // @ts-expect-error - logs is not typed
        const id = log.args?.proposalId?.toString();
        const retrieveProposal = publicClient?.readContract({
          abi: contract.abi,
          address: contract.address,
          functionName: "getOneProposal",
          args: [id],
          account: address,
        });
        retrieveProposal?.then((proposal) => {
          const proposalBis = proposal as Proposal;
          proposalBis.id = parseInt(id);
          setProposals([...proposals, proposalBis]);
        });
      }
    },
  });

  return (
    <div className="container-main">
      <Role
        isConnected={isConnected}
        labelVoter={labelVoter(address, typedOwner, voter)}
      />
      <ContractInfos
        owner={typedOwner}
        workflowStatus={WorkflowStatus[workflowStatus?.toString() ?? "99"]}
      />
      <NextStep owner={typedOwner} workflowStatus={typedWorkflowStatus} />
      <Status
        voter={voter}
        winner={typedWinner}
        workflowStatus={typedWorkflowStatus}
      />
      <AddVoter
        owner={typedOwner}
        workflowStatus={typedWorkflowStatus}
        address={address}
      />
      <AddProposal voter={voter} workflowStatus={typedWorkflowStatus} />
      <Vote voter={voter} workflowStatus={typedWorkflowStatus} />
      {voter?.isRegistered && <Events proposals={proposals} />}
    </div>
  );
};

export default Bank;
