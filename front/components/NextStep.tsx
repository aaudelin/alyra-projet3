import { Button } from "@/components/ui/button";
import { contract } from "@/app/contract";
import { useWriteContract, useAccount } from 'wagmi'

const NextStep = ({ owner, workflowStatus }) => {

    const WorkflowStatusActions: Record<string, string> = {
        "0": "startProposalsRegistering",
        "1": "endProposalsRegistering",
        "2": "startVotingSession",
        "3": "endVotingSession",
        "4": "tallyVotes",
      };

    const { data: hash, isPending, writeContract } = useWriteContract();
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