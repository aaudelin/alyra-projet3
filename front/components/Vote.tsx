import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { contract } from "@/app/contract";
import { useWriteContract } from 'wagmi'

const Vote = ({ voter, workflowStatus }) => {

    const { data: hash, isPending, writeContract } = useWriteContract();

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
      <>
      {workflowStatus?.toString() === "3" && voter?.isRegistered && !voter?.hasVoted && (
        <section className="form-section">
            <p className="form-title">Voting Session</p>
            <form className="flex gap-2" onSubmit={handleSubmitVote}>
                <Input name="proposalId" type="number" min={1} placeholder="Proposal ID" className="form-input" />
                <Button type="submit" className="form-button">Vote</Button>
            </form>
        </section>
      )}
    </>
    )
  }
  export default Vote