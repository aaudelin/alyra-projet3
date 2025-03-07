"use client";

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
    <div className="container mx-auto px-4 py-8">
      <header className="flex justify-between mb-8">
        <h1 className="text-4xl font-bold">DApp Voting</h1>
        <div>
          <ConnectButton />
          {isConnected && (
            <div className="flex gap-2 justify-end mt-2">
              <div className="text-sm font-medium bg-purple-100 dark:bg-purple-900 dark:text-purple-100 px-3 py-1 rounded-full">
                Role: {labelVoter(address, owner, voter)}
              </div>
            </div>
          )}
        </div>
      </header>

      {isConnected && (
        <main>
          <div className="mb-8">
            <div className="font-semibold bg-purple-100 dark:bg-purple-900 text-purple-900 dark:text-purple-100 inline-block px-4 py-2 rounded-lg">
              <p className="text-lg">Informations of the contract</p>
              <p>
                Current status:{" "}
                {WorkflowStatus[workflowStatus?.toString() ?? "99"]}
              </p>
              <p>Owner: {owner?.toString()}</p>
            </div>
          </div>
        </main>
      )}

      {workflowStatus?.toString() === "0" && owner?.toString() === address && (
        <div>
          <p className="text-lg font-semibold mb-4 text-purple-900 dark:text-purple-100">
            Add a new voter
          </p>
          <form className="flex gap-2" onSubmit={handleSubmitAddVoter}>
            <Input name="address" type="text" placeholder="Address" />
            <Button type="submit">Add</Button>
          </form>
        </div>
      )}

      {workflowStatus?.toString() === "1" && voter?.isRegistered && (
        <div>
          <p className="text-lg font-semibold mb-4 text-purple-900 dark:text-purple-100">
            Add a new Proposal
          </p>
          <form className="flex gap-2" onSubmit={handleSubmitProposal}>
            <Input name="proposal" type="text" placeholder="Proposal" />
            <Button type="submit">Add</Button>
          </form>
        </div>
      )}

      {workflowStatus?.toString() === "2" && voter?.isRegistered && (
        <div>
          <p className="text-lg font-semibold mb-4 text-purple-900 dark:text-purple-100">
            Proposals registration ended
          </p>
        </div>
      )}

      {workflowStatus?.toString() === "3" &&
        voter?.isRegistered &&
        !voter?.hasVoted && (
          <div>
            <p className="text-lg font-semibold mb-4 text-purple-900 dark:text-purple-100">
              Voting Session
            </p>
            <form className="flex gap-2" onSubmit={handleSubmitVote}>
              <Input name="proposalId" type="number" min={1} />
              <Button type="submit">Vote</Button>
            </form>
          </div>
        )}

      {workflowStatus?.toString() === "3" &&
        voter?.isRegistered &&
        voter?.hasVoted && (
          <div>
            <p className="text-lg font-semibold mb-4 text-purple-900 dark:text-purple-100">
              Voting Session
            </p>
            <p>You have already voted</p>
          </div>
        )}

      {workflowStatus?.toString() === "4" && voter?.isRegistered && (
        <div>
          <p className="text-lg font-semibold mb-4 text-purple-900 dark:text-purple-100">
            Voting Session Ended
          </p>
        </div>
      )}

      {workflowStatus?.toString() === "5" && (
        <div>
          <p className="text-lg font-semibold mb-4 text-purple-900 dark:text-purple-100">
            Votes Tallied
          </p>
          <p>Proposal with the most votes: {winner?.toString()}</p>
        </div>
      )}

      {isConnected && owner?.toString() === address && workflowStatus?.toString() !== "5" && (
        <Button
          className="mt-8"
          variant="destructive"
          onClick={handleNextStatus}
        >
          Next Step
        </Button>
      )}
    </div>
  );
}
