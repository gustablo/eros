
const credentials = require('./credentials.eros');

class Eros {

    query = '';
    table = '';
    wheres = '';
    connected =false;

    connect() {
        this.connected = true;
    }

    from(table) {
        this.table = table;

        return this;
    }

    select(fields = []) {
        if (fields.length) {
            this.query += `SELECT ${fields.join(', ')} FROM ${this.table} `;

            return this;
        }

        this.query += `SELECT * FROM ${this.table} `;

        return this;
    }

    andWhere(field, value) {
        if (this.hasWhere()) {
            this.wheres += `AND ${field} = ${this.quotationMarks(value)} `;
            return this;
        }

        this.wheres += `WHERE ${field} = ${this.quotationMarks(value)} `;

        return this;
    }

    orWhere(field, value) {
        if (this.hasWhere()) {
            this.wheres += `OR ${field} = ${this.quotationMarks(value)} `;
            return this;
        }

        this.wheres += `WHERE ${field} = ${this.quotationMarks(value)} `;

        return this;
    }

    insert(object) {
        const keys = Object.keys(object).map(key => `'${key}'`).join(', ');
        const values = Object.values(object).map(key => {
            if (typeof key == 'string') {
                return `'${key}'`;
            } else {
                return key;
            }
        }).join(', ');

        this.query = `INSERT INTO ${this.table} (${keys}) VALUES (${values}) `;

        return this;
    }

    update(object) {
        const keys = Object.keys(object);

        for (const key of keys) {
            if (this.hasUpdate()) {
                this.query += `, ${key} = ${this.quotationMarks(object[key])} `;
            } else {
                this.query = `UPDATE ${this.table} SET ${key} = ${this.quotationMarks(object[key])} `;
            }
        }

        return this;
    }

    delete() {
        this.query = `DELETE FROM ${this.table} `;

        return this;
    }

    hasUpdate() {
        return this.query.includes("UPDATE");
    }

    quotationMarks(value) {
        if (typeof value === 'number') return value;

        return `'${value}'`;
    }

    hasWhere() {
        return this.wheres.includes("WHERE");
    }

    isValidQuery() {
        if (!this.connected) {
            throw new Error('Client not connected');
        }

        if (!this.table) {
            throw new Error('Table not found');
        }

        if (!this.query.includes("SELECT") && !this.query.includes("INSERT") && !this.query.includes("UPDATE") && !this.query.includes("DELETE")) {
            throw new Error('Invalid query');
        }

        if (this.query.includes("INSERT") && this.query.includes("WHERE")) {
            throw new Error('Invalid query');
        }

    }

    async exec() {
        this.isValidQuery();

        const query = this.query + this.wheres;

        this.table = '';
        this.query = '';

        return query;
    }

}

const eros = new Eros();

const sql = eros
    .from('asd')
    .select(['name', 'email', 'password'])
    .orWhere("password", "123")
    .andWhere("id", 2)
    .andWhere("name", "jhon")
    .exec();

const sql2 = eros
    .from('asd')
    .insert({
        name: 'gustavo',
        password: '321',
        age: 21
    })
    .exec();

const sql3 = eros
    .from('asd')
    .update({
        name: 'jhon',
        age: 18
    })
    .andWhere('id', 3)
    .andWhere('name', 'gustavo')
    .exec();

const sql4 = eros
    .from('asd')
    .delete()
    .andWhere('id', 3)
    .exec();

console.log(sql, sql2, sql3, sql4);

