// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0;

import "./IDirectPaymentAddress.sol";
import "./IJuiceTerminal.sol";
import "./IProjects.sol";

interface IDirectPayments {
    function allAddresses(uint256 _projectId)
        external
        view
        returns (IDirectPaymentAddress[] memory);

    function juiceTerminals(uint256 _projectId)
        external
        view
        returns (IJuiceTerminal);

    function beneficiaries(address account) external returns (address);

    function preferConvertedTickets(address account) external returns (bool);

    function projects() external returns (IProjects);

    function operatorStore() external returns (IOperatorStore);

    function deployAddress(
        uint256 _projectId,
        IJuiceTerminal _juiceTerminal,
        string memory _note
    ) external;

    function setJuiceTerminal(uint256 _projectId, IJuiceTerminal _juiceTerminal)
        external;

    function setBeneficiary(address _beneficiary) external;

    function setPreferClaimedTickets(bool _preference) external;
}
