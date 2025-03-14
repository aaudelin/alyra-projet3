import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { contract } from "@/app/contract";
import { useWriteContract } from 'wagmi'

const AddProposal = ({ voter, workflowStatus }) => {

    const { data: hash, isPending, writeContract } = useWriteContract();

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

    return (
      <>
      {workflowStatus?.toString() === "1" && voter?.isRegistered && (
      <section className="form-section">
      <p className="form-title">Add a New Proposal</p>
      <form className="flex gap-2" onSubmit={handleSubmitProposal}>
        <Input name="proposal" type="text" placeholder="Proposal Title" className="form-input" />
        <Button type="submit" className="form-button">Add</Button>
      </form>
    </section>
      )}
    </>
    )
  }
  export default AddProposal