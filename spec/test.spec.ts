import { typifyGen } from "..";

const flowers = [
  {
    petals: 4,
    color: "yellow",
    name: "tulip",
  },
  {
    petals: 7,
    color: "red",
  },
  {
    petals: 8,
    color: "blue",
    brambles: 15,
  },
];

describe("typify-gen", () => {
  it("should throw errors as there is no element to inspect", () => {
    expect(() => typifyGen(null)).toThrow(Error("Undefined or null argument"));
    expect(() => typifyGen("foo" as any)).toThrow(
      Error("The provided arguments should be in an array")
    );
    expect(() => typifyGen([])).toThrow(
      Error("At least one argument should be provided")
    );
  });

  it("should generate using the union of properties", () => {
    const { objects } = typifyGen(flowers);
    objects.forEach((obj) => {
      expect(obj.color).toBeDefined();
      expect(obj.petals).toBeDefined();
    });
    expect(objects[0].name).toBeDefined();
    expect(objects[2].brambles).toBeDefined();
  });

  it("should generate using the intersection of properties", () => {
    const { objects } = typifyGen(flowers, "intersection");
    objects.forEach((obj) => {
      expect(obj.color).toBeDefined();
      expect(obj.petals).toBeDefined();
    });
    expect(objects[1].name).toBeUndefined();
    expect(objects[2].brambles).toBeUndefined();
  });
});

describe("union", () => {
  const {
    objects,
    isGenType,
    isGenTypeInherited,
    genTypeCoercion,
    genTypeKeys,
    genTypeOptionalKeys,
  } = typifyGen(flowers, "union");

  it("should match with keys", () => {
    expect(genTypeKeys).toEqual(["petals", "color", "name", "brambles"]);
  });

  it("should match with optional keys", () => {
    expect(genTypeOptionalKeys).toEqual(["name", "brambles"]);
  });

  it("should be the same type", () => {
    const flower = {
      petals: 2,
      color: "purple",
      name: "orchid",
      brambles: 15,
    };
    expect(isGenType(flower)).toBeTruthy();
    objects.forEach((obj) => expect(isGenType(obj)).toBeTruthy());
  });

  it("should be a different type", () => {
    const flower = {
      petals: 0,
    };
    expect(isGenType(flower)).toBeFalsy();
    expect(isGenType({})).toBeFalsy();
  });

  it("should be an extended type", () => {
    const flower = {
      petals: 2,
      color: "purple",
      name: "orchid",
      brambles: 15,
      ageInDays: 3,
    };
    expect(isGenTypeInherited(flower)).toBeTruthy();
  });

  it("should not be an extended type", () => {
    const flower = {
      petals: 2,
      color: "purple",
      name: "orchid",
      brambles: 15,
    };
    const notAFlower = {
      name: "cat",
    };
    expect(isGenTypeInherited(flower)).toBeFalsy();
    expect(isGenTypeInherited(notAFlower)).toBeFalsy();
  });

  it("should coerce the given objects with the exact same keys", () => {
    const flower = {
      petals: 9,
      color: "blue",
      ageInWeeks: 2,
    };
    expect((genTypeCoercion(flower) as any).ageInWeeks).toBeUndefined();
    expect(
      genTypeCoercion(
        {},
        {
          petals: 2,
          color: "purple",
        }
      )
    ).toEqual(
      jasmine.objectContaining({
        petals: 2,
        color: "purple",
        name: null,
        brambles: null,
      })
    );
  });
});

describe("intersection", () => {
  const {
    objects,
    isGenType,
    isGenTypeInherited,
    genTypeCoercion,
    genTypeKeys,
    genTypeOptionalKeys,
  } = typifyGen(flowers, "intersection");

  it("should match with keys", () => {
    expect(genTypeKeys).toEqual(["petals", "color"]);
  });

  it("should match with optional keys", () => {
    expect(genTypeOptionalKeys).toEqual([]);
  });

  it("should be the same type", () => {
    const flower = {
      petals: 2,
      color: "purple",
    };
    expect(isGenType(flower)).toBeTruthy();
    objects.forEach((obj) => expect(isGenType(obj)).toBeTruthy());
  });

  it("should be a different type", () => {
    const flower = {
      petals: 0,
    };
    expect(isGenType(flower)).toBeFalsy();
    expect(isGenType({})).toBeFalsy();
  });

  it("should be an extended type", () => {
    const flower = {
      petals: 2,
      color: "purple",
      name: "orchid",
    };
    expect(isGenTypeInherited(flower)).toBeTruthy();
  });

  it("should not be an extended type", () => {
    const flower = {
      petals: 2,
      color: "orchid",
    };
    const notAFlower = {
      name: "cat",
    };
    expect(isGenTypeInherited(flower)).toBeFalsy();
    expect(isGenTypeInherited(notAFlower)).toBeFalsy();
  });

  it("should coerce the given objects with the exact same keys", () => {
    const flower = {
      petals: 9,
      color: "blue",
      brambles: 17,
    };
    expect((genTypeCoercion(flower) as any).brambles).toBeUndefined();
    expect(
      genTypeCoercion(
        {},
        {
          petals: 2,
        }
      )
    ).toEqual(
      jasmine.objectContaining({
        petals: 2,
        color: null,
      })
    );
  });
});
