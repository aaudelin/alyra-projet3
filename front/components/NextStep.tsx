import { Button } from "@/components/ui/button";
import { contract } from "@/app/contract";
import { useWriteContract, useAccount } from 'wagmi'

interface NextStepProps {
  owner: `0x${string}` | undefined;
  workflowStatus: bigint | undefined;
}

const NextStep = ({ owner, workflowStatus }: NextStepProps) => {

    const WorkflowStatusActions: Record<string, string> = {
        "0": "startProposalsRegistering",
        "1": "endProposalsRegistering",
        "2": "startVotingSession",
        "3": "endVotingSession",
        "4": "tallyVotes",
      };

    const { writeContract } = useWriteContract();
    const { address, isConnected } = useAccount();

    const handleNextStatus = () => {
        writeContract({
          abi: contract.abi,
          address: contract.address,
          functionName: WorkflowStatusActions[workflowStatus?.toString() ?? "99"],
          account: address,
        });
      };

    return (
      <>
      {isConnected && owner?.toString() === address && workflowStatus?.toString() !== "5" && (
        <div className="footer">
        <Button
          className="form-button form-button-destructive"
          variant="destructive"
          onClick={handleNextStatus}
        >
          Pass to next Step
        </Button>
      </div>
      )}
    </>
    )
  }
  export default NextStep