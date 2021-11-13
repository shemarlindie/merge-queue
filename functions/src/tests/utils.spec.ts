import {expect} from "chai";
import {describe, it} from "mocha";
import {
  stringComparer,
  stringFormatter,
  typeComparer,
  typeFormatter,
  userComparer,
  userFormatter,
} from "../utils";
import { userProxyStub } from "./shared";

const falsyValues = [undefined, null];

describe("user formatter", () => {
  for (const fv of falsyValues) {
    it(`should return '-' when user is ${fv}`, () => {
      expect(userFormatter(fv)).to.equal("-");
    });
    it(`should return '-' when user.displayName is ${fv}`, () => {
      expect(userFormatter(userProxyStub(fv))).to.equal("-");
    });
  }

  it("should return display name if present in user object", () => {
    const displayName = "Jane Doe";
    expect(userFormatter(userProxyStub(displayName))).to.equal(displayName);
  });
});

describe("type formatter", () => {
  for (const fv of falsyValues) {
    it(`should return '-' when type is ${fv}`, () => {
      expect(typeFormatter(fv)).to.equal("-");
    });
  }

  it("should format single type correctly", () => {
    expect(typeFormatter(["Type 1"])).to.equal("Type 1");
  });

  it("should format multiple types correctly", () => {
    expect(typeFormatter(["Type 2", "Type 3"])).to.equal("Type 2, Type 3");
  });

  it("should sort types before formatting", () => {
    expect(typeFormatter(["C", "B", "A"])).to.equal("A, B, C");
  });
});

describe("string formatter", () => {
  for (const fv of falsyValues) {
    it(`should return '-' when string is ${fv}`, () => {
      expect(stringFormatter(fv)).to.equal("-");
    });
  }

  it("should format string correctly", () => {
    const stringVal = "Some value";
    expect(stringFormatter(stringVal)).to.equal(stringVal);
  });
});

describe("user comparer", () => {
  it("should return false if one user is undefined", () => {
    expect(userComparer(userProxyStub("Jane Doe"), undefined)).to.be.false;
  });

  it("should return false if one user is null", () => {
    expect(userComparer(null, userProxyStub("Jane Doe"))).to.be.false;
  });

  it("should return false if users' uids don't match", () => {
    const userA = userProxyStub("Jane Doe");
    const userB = userProxyStub("John Doe");
    expect(userComparer(userA, userB)).to.be.false;
  });

  it("should return true if users' uids match", () => {
    const userA = userProxyStub("Jane Doe");
    const userB = { uid: userA.uid, displayName: "Jane Twin" };
    expect(userComparer(userA, userB)).to.be.true;
  });

  it("should return true if both users are falsy", () => {
    expect(userComparer(null, undefined)).to.be.true;
  });
});

describe("type comparer", () => {
  it("should return false if one type is undefined", () => {
    expect(typeComparer(["Type 1"], undefined)).to.be.false;
  });

  it("should return false if one type is null", () => {
    expect(typeComparer(null, ["Type 1"])).to.be.false;
  });

  it("should return false if one type is empty", () => {
    expect(typeComparer([], ["Type 1"])).to.be.false;
  });

  it("should return false if types don't match", () => {
    expect(typeComparer(["Type 1"], ["Type 2"])).to.be.false;
  });

  it("should return false if one type is falsy and the other empty", () => {
    expect(typeComparer(null, [])).to.be.false;
  });

  it("should return true if both types are empty", () => {
    expect(typeComparer([], [])).to.be.true;
  });

  it("should return true if both types are the same (unsorted)", () => {
    expect(typeComparer(["C", "A", "B"], ["A", "B", "C"])).to.be.true;
  });

  it("should return true if both types are falsy", () => {
    expect(typeComparer(null, undefined)).to.be.true;
  });
});

describe("string comparer", () => {
  it("should return false if one string is null", () => {
    expect(stringComparer("String A", null)).to.be.false;
  });

  it("should return false if one string is undefined", () => {
    expect(stringComparer(undefined, "String A")).to.be.false;
  });

  it("should return false if strings are NOT the same", () => {
    expect(stringComparer("First", "Second")).to.be.false;
  });

  it("should return true if strings are the same", () => {
    expect(stringComparer("ABC", "ABC")).to.be.true;
  });

  it("should return true if both strings are falsy (null, undefined)", () => {
    expect(stringComparer(null, undefined)).to.be.true;
  });

  it("should return true if both strings are falsy (null, '')", () => {
    expect(stringComparer(null, "")).to.be.true;
  });
});
