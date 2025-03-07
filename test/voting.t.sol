// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {Voting} from "../src/voting_correction.sol";
import {Test} from "forge-std/Test.sol";
import {console} from "forge-std/console.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract VotingTestVoter is Test {
    Voting voting;
    address immutable voter1 = makeAddr("Voter1");
    address immutable voter2 = makeAddr("Voter2");
    address owner = makeAddr("Owner");

    function setUp() public {
        vm.prank(owner);
        voting = new Voting();
    }

    function test_getVoterByNonRegistered() public {
        vm.expectRevert("You're not a voter");
        voting.getVoter(voter1);
    }

    function test_addVoterIfNotOpen() public {
        vm.startPrank(owner);
        voting.startProposalsRegistering();

        vm.expectRevert("Voters registration is not open yet");
        voting.addVoter(voter1);
        vm.stopPrank();
    }

    function test_addVoterIfOpen() public {
        vm.prank(owner);
        vm.expectEmit(false, false, false, true);
        emit Voting.VoterRegistered(voter1);
        voting.addVoter(voter1);
    }

    function test_addVoterByOwnerAndGetByVoter() public {
        vm.prank(owner);
        voting.addVoter(voter1);

        vm.startPrank(voter1);
        assertEq(voting.getVoter(voter1).isRegistered, true);
        assertEq(voting.getVoter(voter1).hasVoted, false);
        assertEq(voting.getVoter(voter1).votedProposalId, 0);
        vm.stopPrank();
    }

    function test_addVoterByNonOwner() public {
        vm.prank(voter1);
        vm.expectRevert(abi.encodeWithSelector(Ownable.OwnableUnauthorizedAccount.selector, voter1));
        voting.addVoter(voter2);
    }

    function test_addSameVoter() public {
        vm.startPrank(owner);
        voting.addVoter(voter1);
        vm.expectRevert("Already registered");
        voting.addVoter(voter1);
        vm.stopPrank();
    }
}

contract VotingTestProposals is Test {
    Voting voting;
    address immutable voter1 = makeAddr("Voter1");
    address immutable voter2 = makeAddr("Voter2");
    address owner = makeAddr("Owner");

    function setUp() public {
        vm.startPrank(owner);
        voting = new Voting();
        voting.addVoter(voter1);
        voting.addVoter(voter2);
        voting.startProposalsRegistering();
        vm.stopPrank();
    }

    function test_addProposalIfNotOpen() public {
        vm.prank(owner);
        voting.endProposalsRegistering();

        vm.prank(voter1);
        vm.expectRevert("Proposals are not allowed yet");
        voting.addProposal("Proposal 1");
    }

    function test_onlyForVoters() public {
        vm.prank(owner);
        vm.expectRevert("You're not a voter");
        voting.addProposal("Proposal 1");
    }

    function test_addProposalIfOpen() public {
        vm.startPrank(voter1);
        vm.expectEmit(false, false, false, true);
        emit Voting.ProposalRegistered(1);
        voting.addProposal("Proposal 1");

        assertEq(voting.getOneProposal(1).description, "Proposal 1");
        assertEq(voting.getOneProposal(1).voteCount, 0);
        vm.stopPrank();
    }

    function test_emptyProposal() public {
        vm.startPrank(voter1);
        vm.expectRevert("Vous ne pouvez pas ne rien proposer");
        voting.addProposal("");
        vm.stopPrank();
    }

    function test_addMultipleProposals() public {
        vm.startPrank(voter1);
        voting.addProposal("Proposal 1");
        voting.addProposal("Proposal 2");
        voting.addProposal("Proposal 3");
        assertEq(voting.getOneProposal(0).description, "GENESIS");
        assertEq(voting.getOneProposal(1).description, "Proposal 1");
        assertEq(voting.getOneProposal(2).description, "Proposal 2");
        assertEq(voting.getOneProposal(3).description, "Proposal 3");
        vm.stopPrank();
    }

    function test_votersCanBeDifferent() public {
        vm.startPrank(voter1);
        voting.addProposal("Proposal 1");
        assertEq(voting.getOneProposal(1).description, "Proposal 1");
        vm.stopPrank();

        vm.startPrank(voter2);
        voting.addProposal("Proposal 2");
        assertEq(voting.getOneProposal(2).description, "Proposal 2");
        vm.stopPrank();
    }
}

contract VotingTestVoting is Test {
    Voting voting;
    address immutable voter1 = makeAddr("Voter1");
    address immutable voter2 = makeAddr("Voter2");
    address owner = makeAddr("Owner");

    function setUp() public {
        vm.startPrank(owner);
        voting = new Voting();
        voting.addVoter(voter1);
        voting.addVoter(voter2);
        voting.startProposalsRegistering();
        vm.stopPrank();
        vm.startPrank(voter1);
        voting.addProposal("Proposal 1");
        voting.addProposal("Proposal 2");
        vm.stopPrank();
        vm.startPrank(owner);
        voting.endProposalsRegistering();
        voting.startVotingSession();
        vm.stopPrank();
    }

    function test_onlyForVoters() public {
        vm.prank(owner);
        vm.expectRevert("You're not a voter");
        voting.setVote(1);
    }

    function test_votingSessionNotStarted() public {
        vm.prank(owner);
        voting.endVotingSession();
        vm.prank(voter1);
        vm.expectRevert("Voting session havent started yet");
        voting.setVote(1);
    }

    function test_missingProposal() public {
        vm.prank(voter1);
        vm.expectRevert("Proposal not found");
        voting.setVote(100);
    }

    function test_voteOk() public {
        vm.startPrank(voter1);
        vm.expectEmit(false, false, false, true);
        emit Voting.Voted(voter1, 1);
        voting.setVote(1);
        assertEq(voting.getOneProposal(1).voteCount, 1);
        assertEq(voting.getOneProposal(1).description, "Proposal 1");
        assertEq(voting.getVoter(voter1).hasVoted, true);
        assertEq(voting.getVoter(voter1).votedProposalId, 1);
        vm.stopPrank();
    }

    function test_voteTwice() public {
        vm.startPrank(voter1);
        voting.setVote(1);

        vm.expectRevert("You have already voted");
        voting.setVote(2);
        vm.stopPrank();
    }

    function test_twoVotesSameProposal() public {
        vm.prank(voter1);
        voting.setVote(1);
        vm.startPrank(voter2);
        voting.setVote(1);

        assertEq(voting.getOneProposal(1).voteCount, 2);
        assertEq(voting.getOneProposal(2).voteCount, 0);
        vm.stopPrank();
    }

    function test_twoVotesDifferentProposal() public {
        vm.prank(voter1);
        voting.setVote(1);
        vm.startPrank(voter2);
        voting.setVote(2);

        assertEq(voting.getOneProposal(1).voteCount, 1);
        assertEq(voting.getOneProposal(2).voteCount, 1);
        vm.stopPrank();
    }
}

contract VotingTestState is Test {
    Voting voting;
    address owner = makeAddr("Owner");

    function setUp() public {
        vm.prank(owner);
        voting = new Voting();
    }

    function test_defaultState() public view {
        assertEq(uint256(voting.workflowStatus()), uint256(Voting.WorkflowStatus.RegisteringVoters));
    }

    function test_startProposalsRegistering() public {
        vm.startPrank(owner);
        voting.addVoter(owner);

        vm.expectEmit(false, false, false, true);
        emit Voting.WorkflowStatusChange(
            Voting.WorkflowStatus.RegisteringVoters, Voting.WorkflowStatus.ProposalsRegistrationStarted
        );
        voting.startProposalsRegistering();

        assertEq(uint256(voting.workflowStatus()), uint256(Voting.WorkflowStatus.ProposalsRegistrationStarted));
        assertEq(voting.getOneProposal(0).description, "GENESIS");
        vm.stopPrank();
    }

    function test_startProposalsRegisteringFails() public {
        vm.startPrank(owner);
        voting.addVoter(owner);
        voting.startProposalsRegistering();
        voting.endProposalsRegistering();

        vm.expectRevert("Registering proposals cant be started now");
        voting.startProposalsRegistering();
        vm.stopPrank();
    }

    function test_endProposalsRegistering() public {
        vm.startPrank(owner);
        voting.addVoter(owner);
        voting.startProposalsRegistering();

        vm.expectEmit(false, false, false, true);
        emit Voting.WorkflowStatusChange(
            Voting.WorkflowStatus.ProposalsRegistrationStarted, Voting.WorkflowStatus.ProposalsRegistrationEnded
        );
        voting.endProposalsRegistering();

        assertEq(uint256(voting.workflowStatus()), uint256(Voting.WorkflowStatus.ProposalsRegistrationEnded));
        vm.stopPrank();
    }

    function test_endProposalsRegisteringFails() public {
        vm.startPrank(owner);
        voting.addVoter(owner);

        vm.expectRevert("Registering proposals havent started yet");
        voting.endProposalsRegistering();
        vm.stopPrank();
    }

    function test_startVotingSession() public {
        vm.startPrank(owner);
        voting.addVoter(owner);
        voting.startProposalsRegistering();
        voting.endProposalsRegistering();

        vm.expectEmit(false, false, false, true);
        emit Voting.WorkflowStatusChange(
            Voting.WorkflowStatus.ProposalsRegistrationEnded, Voting.WorkflowStatus.VotingSessionStarted
        );
        voting.startVotingSession();

        assertEq(uint256(voting.workflowStatus()), uint256(Voting.WorkflowStatus.VotingSessionStarted));
        vm.stopPrank();
    }

    function test_startVotingSessionFails() public {
        vm.startPrank(owner);
        voting.addVoter(owner);

        vm.expectRevert("Registering proposals phase is not finished");
        voting.startVotingSession();
        vm.stopPrank();
    }

    function test_endVotingSession() public {
        vm.startPrank(owner);
        voting.addVoter(owner);
        voting.startProposalsRegistering();
        voting.endProposalsRegistering();
        voting.startVotingSession();

        vm.expectEmit(false, false, false, true);
        emit Voting.WorkflowStatusChange(
            Voting.WorkflowStatus.VotingSessionStarted, Voting.WorkflowStatus.VotingSessionEnded
        );
        voting.endVotingSession();

        assertEq(uint256(voting.workflowStatus()), uint256(Voting.WorkflowStatus.VotingSessionEnded));
        vm.stopPrank();
    }

    function test_endVotingSessionFails() public {
        vm.startPrank(owner);
        voting.addVoter(owner);

        vm.expectRevert("Voting session havent started yet");
        voting.endVotingSession();
        vm.stopPrank();
    }
}

contract VotingTestTallying is Test {
    Voting voting;
    address owner = makeAddr("Owner");
    address voter1 = makeAddr("Voter1");
    address voter2 = makeAddr("Voter2");
    address voter3 = makeAddr("Voter3");

    function setUp() public {
        vm.startPrank(owner);
        voting = new Voting();
        voting.addVoter(owner);
        voting.addVoter(voter1);
        voting.addVoter(voter2);
        voting.addVoter(voter3);
        voting.startProposalsRegistering();
        vm.stopPrank();
        vm.prank(voter1);
        voting.addProposal("Proposal 1");
        vm.prank(voter2);
        voting.addProposal("Proposal 2");
        vm.prank(voter3);
        voting.addProposal("Proposal 3");
        vm.startPrank(owner);
        voting.endProposalsRegistering();
        voting.startVotingSession();
        vm.stopPrank();
    }

    function test_wrongStatus() public {
        vm.startPrank(owner);

        vm.expectRevert("Current status is not voting session ended");
        voting.tallyVotes();
        vm.stopPrank();
    }

    function test_tallyVotesGenesis() public {
        vm.startPrank(owner);
        voting.endVotingSession();

        vm.expectRevert("No proposal has been voted for");
        voting.tallyVotes();

        vm.stopPrank();
    }

    function test_tallyVotesEquality() public {
        vm.prank(voter1);
        voting.setVote(1);
        vm.prank(voter2);
        voting.setVote(2);
        vm.prank(voter3);
        voting.setVote(3);

        vm.startPrank(owner);
        voting.endVotingSession();
        voting.tallyVotes();

        assertEq(voting.winningProposalID(), 1);
        vm.stopPrank();
    }

    function test_tallyVotesInequality() public {
        vm.prank(voter1);
        voting.setVote(1);
        vm.prank(voter2);
        voting.setVote(2);
        vm.prank(voter3);
        voting.setVote(2);

        vm.startPrank(owner);
        voting.endVotingSession();
        voting.tallyVotes();

        assertEq(voting.winningProposalID(), 2);
        vm.stopPrank();
    }
}
