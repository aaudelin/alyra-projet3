"use client";

import './styles.css'; 
import { ConnectButton } from "@rainbow-me/rainbowkit";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useBlockNumber,
} from "wagmi";
import { contract } from "./contract";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect } from "react";

const WorkflowStatus: Record<string, string> = {
  "0": "Registering voters",
  "1": "Proposals registration",
  "2": "Proposals registration ended",
  "3": "Voting session started",
  "4": "Voting session ended",
  "5": "Votes Tallied",
  "99": "Unknown",
};
const WorkflowStatusActions: Record<string, string> = {
  "0": "startProposalsRegistering",
  "1": "endProposalsRegistering",
  "2": "startVotingSession",
  "3": "endVotingSession",
  "4": "tallyVotes",
};

function labelVoter(address?: `0x${string}`, owner?: any, voter?: any) {
  if (address === owner) {
    return "Owner";
  }
  if (voter?.isRegistered) {
    return "Voter";
  }
  return "Unknown";
}

export default function Home() {
  const { data: hash, writeContract } = useWriteContract();
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

  const handleNextStatus = () => {
    writeContract({
      abi: contract.abi,
      address: contract.address,
      functionName: WorkflowStatusActions[workflowStatus?.toString() ?? "99"],
      account: address,
    });
  };

  const handleSubmitAddVoter = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newAddress = formData.get("address") as `0x${string}`;
    writeContract({
      abi: contract.abi,
      address: contract.address,
      functionName: "addVoter",
      args: [newAddress],
    });
  };

  const handleSubmitProposal = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newProposal = formData.get("proposal") as string;
    writeContract({
      abi: contract.abi,
      address: contract.address,
      functionName: "addProposal",
      args: [newProposal],
    });
  };

  const handleSubmitVote = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const proposalIdValue = formData.get("proposalId");
    const proposalId = proposalIdValue ? Number(proposalIdValue.toString()) : 0;
    writeContract({
      abi: contract.abi,
      address: contract.address,
      functionName: "setVote",
      args: [BigInt(proposalId)],
    });
  };

  return (
    <div className="container-main">
    <header className="header">
      <h1 className="header-title">DApp Voting</h1>
      <div>
        <ConnectButton />
        {isConnected && (
          <div className="header-connect-button">
            <div className="header-role-badge">
              Role: {labelVoter(address, owner, voter)}
            </div>
          </div>
        )}
      </div>
    </header>
  
    {isConnected && (
      <main>
        <section className="contract-info">
          <div className="contract-info-header">
            <p className="text-lg">Contract Information</p>
          </div>
          <div className="contract-info-text">
            <p><strong>Current Status:</strong> {WorkflowStatus[workflowStatus?.toString() ?? "99"]}</p>
            <p><strong>Owner:</strong> {owner?.toString()}</p>
          </div>
        </section>
      </main>
    )}
  
    {workflowStatus?.toString() === "0" && owner?.toString() === address && (
      <section className="form-section">
        <p className="form-title">Add a New Voter</p>
        <form className="flex gap-2" onSubmit={handleSubmitAddVoter}>
          <Input name="address" type="text" placeholder="Voter Address" className="form-input" />
          <Button type="submit" className="form-button">Add</Button>
        </form>
      </section>
    )}
  
    {workflowStatus?.toString() === "1" && voter?.isRegistered && (
      <section className="form-section">
        <p className="form-title">Add a New Proposal</p>
        <form className="flex gap-2" onSubmit={handleSubmitProposal}>
          <Input name="proposal" type="text" placeholder="Proposal Title" className="form-input" />
          <Button type="submit" className="form-button">Add</Button>
        </form>
      </section>
    )}
  
    {workflowStatus?.toString() === "2" && voter?.isRegistered && (
      <section className="form-section">
        <p className="form-title">Proposals Registration Ended</p>
      </section>
    )}
  
    {workflowStatus?.toString() === "3" && voter?.isRegistered && !voter?.hasVoted && (
      <section className="form-section">
        <p className="form-title">Voting Session</p>
        <form className="flex gap-2" onSubmit={handleSubmitVote}>
          <Input name="proposalId" type="number" min={1} placeholder="Proposal ID" className="form-input" />
          <Button type="submit" className="form-button">Vote</Button>
        </form>
      </section>
    )}
  
    {workflowStatus?.toString() === "3" && voter?.isRegistered && voter?.hasVoted && (
      <section className="form-section">
        <p className="form-title">Voting Session</p>
        <p className="text-gray-700 dark:text-gray-300">You have already voted.</p>
      </section>
    )}
  
    {workflowStatus?.toString() === "4" && voter?.isRegistered && (
      <section className="form-section">
        <p className="form-title">Voting Session Ended</p>
      </section>
    )}
  
    {workflowStatus?.toString() === "5" && (
      <section className="form-section">
        <p className="form-title">Votes Tallied</p>
        <p className="text-gray-700 dark:text-gray-300">Proposal with the most votes: {winner?.toString()}</p>
      </section>
    )}
  
    {isConnected && owner?.toString() === address && workflowStatus?.toString() !== "5" && (
      <div className="footer">
        <Button
          className="form-button form-button-destructive"
          variant="destructive"
          onClick={handleNextStatus}
        >
          Next Step
        </Button>
      </div>
    )}
  </div>);
}
