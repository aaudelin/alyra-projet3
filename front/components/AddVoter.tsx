import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { contract } from "@/app/contract";
import { useWriteContract } from "wagmi";

interface AddVoterProps {
  owner: `0x${string}` | undefined;
  address: `0x${string}` | undefined;
  workflowStatus: unknown;
}

const AddVoter = ({ owner, address, workflowStatus }: AddVoterProps) => {
  const { writeContract } = useWriteContract();

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

  return (
    <>
      {workflowStatus?.toString() === "0" && owner?.toString() === address && (
        <section className="form-section">
          <p className="form-title">Add a New Voter</p>
          <form className="flex gap-2" onSubmit={handleSubmitAddVoter}>
            <Input
              name="address"
              type="text"
              placeholder="Voter Address"
              className="form-input"
            />
            <Button type="submit" className="form-button">
              Add
            </Button>
          </form>
        </section>
      )}
    </>
  );
};
export default AddVoter;
