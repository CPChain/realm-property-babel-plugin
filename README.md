# realm-property-babel-plugin

Expand Enum type and BigNumber type for @ realm/label plugin

## Usage

```typescript
enum TestType {
  CPChain = 1,
  Ethereum,
}

class TestObject extends Realm.Object {
  readonly _id = new Realm.BSON.ObjectId();
  @RealmEnum
  type!: TestType;
  @RealmBigNumber
  balance!: BigNumber;
  description!: string;
  static primaryKey = '_id';
  constructor(
    realm: Realm,
    {
      type,
      description,
      balance,
    }: {
      type: TestType;
      description: string;
      balance: BigNumber;
    },
  ) {
    super(realm, {
      _type: type,
      _balance: balance.toHexString(),
      description,
    });
  }
}

```

