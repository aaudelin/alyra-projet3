// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title Voting contract to submit and vote for proposals
/// @author @alyra
/// @notice This contract is used to create a voting session for proposals that are registered in the session using a strict workflow. 
/// @notice The proposales are submitted by the voters. The votes tallying is computed using the highest vote count.
/// @dev The contract is owned by the owner, who is the creator of the contract. The workflow is managed by the owner. This workflow is strict and must be followed in the right order using WorkflowStatus enum.
contract Voting is Ownable {
    /// @notice The winning proposal ID
    uint256 public winningProposalID;

    /// @notice Temporary winning proposal
    uint256 private temporaryWinningProposalId;

    /// @notice The struct of a voter with a registration status, a voting status and a voted proposal ID
    struct Voter {
        bool isRegistered;
        bool hasVoted;
        uint256 votedProposalId;
    }

    /// @notice The struct of a proposal with a description and a vote count incremented by each vote
    struct Proposal {
        string description;
        uint256 voteCount;
    }

    /// @notice The enum of the workflow status
    enum WorkflowStatus {
        RegisteringVoters,
        ProposalsRegistrationStarted,
        ProposalsRegistrationEnded,
        VotingSessionStarted,
        VotingSessionEnded,
        VotesTallied
    }

    /// @notice The current workflow status
    WorkflowStatus public workflowStatus;

    /// @notice The array of proposals submitted by the voters
    Proposal[] proposalsArray;

    /// @notice The mapping of voters by address
    mapping(address => Voter) voters;

    /// @notice The event of a voter being registered
    /// @param voterAddress The address of the voter
    event VoterRegistered(address voterAddress);

    /// @notice The event of the workflow status changing
    /// @param previousStatus The previous workflow status
    /// @param newStatus The new workflow status
    event WorkflowStatusChange(WorkflowStatus previousStatus, WorkflowStatus newStatus);

    /// @notice The event of a proposal being registered
    /// @param proposalId The ID of the proposal
    event ProposalRegistered(uint256 proposalId);

    /// @notice The event of a vote being cast
    /// @param voter The address of the voter
    /// @param proposalId The ID of the proposal
    event Voted(address voter, uint256 proposalId);

    /// @notice The constructor of the contract
    /// @dev The constructor calls the Ownable constructor with the msg.sender as the owner
    constructor() Ownable(msg.sender) {}

    /// @notice The modifier to check if the caller is a voter
    modifier onlyVoters() {
        require(voters[msg.sender].isRegistered, "You're not a voter");
        _;
    }

    /// @notice The function to get a voter by address
    /// @dev The function is only callable by voters (onlyVoters modifier)
    /// @param _addr The address of the voter
    /// @return The voter details
    function getVoter(address _addr) external view onlyVoters returns (Voter memory) {
        return voters[_addr];
    }

    /// @notice The function to get a proposal by ID
    /// @dev The function is only callable by voters (onlyVoters modifier)
    /// @param _id The ID of the proposal
    /// @return The proposal details
    function getOneProposal(uint256 _id) external view onlyVoters returns (Proposal memory) {
        return proposalsArray[_id];
    }

    /// @notice Add a new voter to the voting session voters list
    /// @dev The function is only callable by the owner. Emits an event when a voter is registered. The voter must not be registered yet and the workflow status must be RegisteringVoters
    /// @param _addr The address of the voter
    function addVoter(address _addr) external onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, "Voters registration is not open yet");
        require(voters[_addr].isRegistered != true, "Already registered");

        voters[_addr].isRegistered = true;
        emit VoterRegistered(_addr);
    }

    /// @notice Add a new proposal to the voting session proposals list
    /// @dev The function is only callable by voters (onlyVoters modifier). Emits an event when a proposal is registered. The proposal must not be empty and the workflow status must be ProposalsRegistrationStarted
    /// @param _desc The description of the proposal
    function addProposal(string calldata _desc) external onlyVoters {
        require(workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, "Proposals are not allowed yet");
        require(keccak256(abi.encode(_desc)) != keccak256(abi.encode("")), "Vous ne pouvez pas ne rien proposer"); // facultatif
        // voir que desc est different des autres

        Proposal memory proposal;
        proposal.description = _desc;
        proposalsArray.push(proposal);
        // proposalsArray.push(Proposal(_desc,0));
        emit ProposalRegistered(proposalsArray.length - 1);
    }

    /// @notice Vote for a proposal as a voter
    /// @dev The function is only callable by voters (onlyVoters modifier). Emits an event when a vote is cast. The voter cannot vote twice and the workflow status must be VotingSessionStarted
    /// @dev Updates the proposal vote count and the voter.
    /// @param _id The ID of the proposal
    function setVote(uint256 _id) external onlyVoters {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, "Voting session havent started yet");
        require(voters[msg.sender].hasVoted != true, "You have already voted");
        require(_id < proposalsArray.length, "Proposal not found"); // pas obligé, et pas besoin du >0 car uint

        voters[msg.sender].votedProposalId = _id;
        voters[msg.sender].hasVoted = true;
        proposalsArray[_id].voteCount++;

        if (proposalsArray[_id].voteCount > proposalsArray[temporaryWinningProposalId].voteCount) {
            temporaryWinningProposalId = _id;
        }

        emit Voted(msg.sender, _id);
    }

    /// @notice Start the proposals registration
    /// @dev The function is only callable by the owner. Emits an event when the proposals registration starts. The workflow status must be RegisteringVoters
    /// @dev Adds a default proposal called GENESIS to the proposals list.
    function startProposalsRegistering() external onlyOwner {
        require(workflowStatus == WorkflowStatus.RegisteringVoters, "Registering proposals cant be started now");
        workflowStatus = WorkflowStatus.ProposalsRegistrationStarted;

        Proposal memory proposal;
        proposal.description = "GENESIS";
        proposalsArray.push(proposal);

        emit WorkflowStatusChange(WorkflowStatus.RegisteringVoters, WorkflowStatus.ProposalsRegistrationStarted);
    }

    /// @notice End the proposals registration
    /// @dev The function is only callable by the owner. Emits an event when the proposals registration ends. The workflow status must be ProposalsRegistrationStarted
    function endProposalsRegistering() external onlyOwner {
        require(
            workflowStatus == WorkflowStatus.ProposalsRegistrationStarted, "Registering proposals havent started yet"
        );
        workflowStatus = WorkflowStatus.ProposalsRegistrationEnded;
        emit WorkflowStatusChange(
            WorkflowStatus.ProposalsRegistrationStarted, WorkflowStatus.ProposalsRegistrationEnded
        );
    }

    /// @notice Start the voting session
    /// @dev The function is only callable by the owner. Emits an event when the voting session starts. The workflow status must be ProposalsRegistrationEnded
    function startVotingSession() external onlyOwner {
        require(
            workflowStatus == WorkflowStatus.ProposalsRegistrationEnded, "Registering proposals phase is not finished"
        );
        workflowStatus = WorkflowStatus.VotingSessionStarted;
        emit WorkflowStatusChange(WorkflowStatus.ProposalsRegistrationEnded, WorkflowStatus.VotingSessionStarted);
    }

    /// @notice End the voting session
    /// @dev The function is only callable by the owner. Emits an event when the voting session ends. The workflow status must be VotingSessionStarted
    function endVotingSession() external onlyOwner {
        require(workflowStatus == WorkflowStatus.VotingSessionStarted, "Voting session havent started yet");
        workflowStatus = WorkflowStatus.VotingSessionEnded;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionStarted, WorkflowStatus.VotingSessionEnded);
    }

    /// @notice Tally the votes
    /// @dev The function is only callable by the owner. Emits an event when the votes are tallied. The workflow status must be VotingSessionEnded
    /// @dev This function computes the winning proposal ID based on the vote count. The equal vote count is possible, the first proposal with the highest vote count is the winner.
    function tallyVotes() external onlyOwner {
        require(workflowStatus == WorkflowStatus.VotingSessionEnded, "Current status is not voting session ended");
        require(temporaryWinningProposalId != 0, "No proposal has been voted for");

        winningProposalID = temporaryWinningProposalId;
        workflowStatus = WorkflowStatus.VotesTallied;
        emit WorkflowStatusChange(WorkflowStatus.VotingSessionEnded, WorkflowStatus.VotesTallied);
    }
}
