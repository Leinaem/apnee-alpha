// Config.
import { ddbClient } from './dbconfig';
import { ddbDocClient } from "./ddbDocClient";
import { v4 as uuidv4 } from 'uuid';

// Required AWS SDK clients and commands.
import { ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { ScanCommand, DeleteCommand, UpdateCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

// Type.
import { GenericStringIndex } from '@/app/type/generic';

export const fetchTableList = async (): Promise<string[] | undefined> => {
  try {
    const list = await ddbClient.send(new ListTablesCommand({}));

    return list.TableNames;
  } catch (err) {
    console.log('Error', err);
  }
};

export const scanTable = async (tableName: string): Promise<Record<string, any>[] | undefined> => {
  if (tableName) {
    try {
      const data = await ddbClient.send(new ScanCommand({ TableName: tableName }));
      return data.Items;
    } catch (err) {
      console.log('Error', err);
    }
  }
};

export const deleteItemFromDB = async (tableName: string, primaryKeyValue: string, sortKeyValue: string) => {
  try {
    await ddbClient.send(
      new DeleteCommand({
        TableName: tableName,
        Key: {
          id: primaryKeyValue, // primarykeyName : primaryKeyValue
          dateAdded: sortKeyValue, // sortkeyName : sortkeyValue
        },
      })
    );
    console.log('Success - item deleted');
  } catch (err) {
    console.log('Error', err);
  }
};

// export const getDatabasAttributes = async () => {
//   try {
//     console.log('-1-');
//     const databasAttributes = await axios({
//       method: 'get',
//       url: `${process.env.NEXT_PUBLIC_ASSET_URL}database-attributes.json`,
//       headers: { 'Content-Type': 'application/json' },
//       responseType: 'json',
//     });

//     console.log('----', databasAttributes);

//     return databasAttributes.data;
//   } catch (err) {
//     console.log('err', err);
//   }
// };

export const updateData = async (tableName: string, keys: object, data: object) => {
  const updateExpression = Object.keys(data)
    .map((key, index) => `${key} = :val${index}`) // Exemple de mise à jour avec 'SET'
    .join(', ');

  const expressionAttributeValues = Object.fromEntries(
    Object.entries(data).map((entry, index) => [`:val${index}`, entry[1]])
  );

  const params = {
    TableName: tableName,
    Key: keys,
    UpdateExpression: `SET ${updateExpression}`, // Utilisation de 'SET' pour une mise à jour classique
    ExpressionAttributeValues: expressionAttributeValues,
  };

  try {
    const result = await ddbClient.send(new UpdateCommand(params));
    console.log('Success - updated', result);
    alert('Data Updated Successfully');
  } catch (err) {
    console.log('Error', err);
  }
};

export const addData = async (tableName: string, item: object) => {
  try {
    const params = {
      TableName: tableName,
      Item: {
        ...item,
        dateAdded: new Date().toLocaleString(),
        id: uuidv4(),
      },
    };

    await ddbClient.send(new PutCommand(params));
    alert('Data Added Successfully');
    const elem = document.getElementById('updatedata-form') as HTMLFormElement;
    elem?.reset();
  } catch (err) {
    console.log('Error', err);
  }
};

export const addMultiData = async (tableName: string, items: GenericStringIndex[]) => {
  try {
    items.forEach(async (item) => {

      if (tableName === 'results') {
        const id = `${item.compId}_${item.category}_${item.lastName}_${item.firstName}`;
        item.id = id.replaceAll(' ', '-');
      }

      const params = {
        TableName: tableName,
        Item: {
          ...item,
        },
        ConditionExpression:'attribute_not_exists(id)'
      };
      console.log('params : ', params);
      const data = await ddbDocClient.send(new PutCommand(params));
      console.log("Success - item added", data);

    });
    
    alert(`Les données ont été importées avec succes.`);
  } catch (error) {
    let errorMessage = "Echec de l'import.";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.log(errorMessage);
  }
}
