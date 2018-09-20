const knex = require('../../db');
const BaseJoi = require('joi');
const Extension = require('joi-date-extensions');
const Joi = BaseJoi.extend(Extension);
const moment = require('moment');

class ReservationsModel {
    constructor() {
        this.id = null;
        this.guests = null;
        this.time = null;
        this.duration = null;
        this.reservationEnd = null;
        this.freeTables = null;
    }

    /**
     * Validate view,delete,update request params
     * @param id
     * @returns {boolean}
     */
    validateId(id) {
        const schema = Joi.number().integer().required();
        let {value: result, error} = Joi.validate(id, schema);

        if (error === null) {
            this.id = result;
            return true;
        }

        return false;
    }

    /**
     * Validate create and update request body
     * @param data
     * @returns {boolean}
     */
    validate(data) {
        const schema = Joi.object().keys({
            reservation: Joi.object().keys({
                guests: Joi.number().integer().min(1).max(10).required(),
                time: Joi.date().format('YYYY-MM-DDTHH:mm:ssZ').iso().min('now').required(),
                duration: Joi.number().precision(1).min(0.5).max(6.0).required()
            }).required()
        }).required();

        let {value: result, error} = Joi.validate(data, schema);

        if (error === null) {
            this.guests = result.reservation.guests;
            this.time = moment(result.reservation.time, 'YYYY-MM-DDTHH:mm:ssZ').utc().format('YYYY-MM-DDTHH:mm:ssZ');
            this.duration = result.reservation.duration;
            let duration = `${this.duration}`.split('.');
            let hours = parseInt(duration[0]);
            let minutes = 60 / parseInt(duration[1]) || 0;
            this.reservationEnd = moment(this.time, 'YYYY-MM-DDTHH:mm:ssZ').utc()
                .add(hours, 'h').add(minutes, 'm')
                .format('YYYY-MM-DDTHH:mm:ssZ');
            return true;
        }

        return false;
    }

    /**
     * Search for available tables return true if exists
     * @returns {Promise<*>}
     */
    async isUpdateConflict() {
        const freeTables = await this.getFreeTables(this.id);

        if (freeTables instanceof Error) {
            return freeTables;
        }

        return !!freeTables.length;
    }

    /**
     * Return free tables
     * @param {number} [excludeReservationId]
     * @returns {Promise<*>}
     */
    async getFreeTables(excludeReservationId) {
        let result;
        try {
            const subquery = knex('reservations')
                .andWhereBetween('reservations.start', [this.time, this.reservationEnd])
                .orWhereBetween('reservations.end', [this.time, this.reservationEnd])
                .modify(function (queryBuilder) {
                    if (excludeReservationId) {
                        queryBuilder.where('reservations.id', '!=', excludeReservationId);
                    }
                })
                .select('table_id');
            result = await knex('tables')
                .where('capacity', '>=', this.guests)
                .andWhere('id', 'not in', subquery);
        } catch (e) {
            console.log(e.message);
            return new Error(e.message);
        }
        this.freeTables = result;
        return result;
    }

    /**
     * Update single row
     * @returns {Promise<*>}
     */
    async update() {
        if (this.freeTables.length) {
            let reservation;
            try {
                reservation = await knex('reservations')
                    .where('id', this.id)
                    .update({
                        table_id: this.freeTables[0].id,
                        start: this.time,
                        end: this.reservationEnd,
                        guests: this.guests
                    });
            } catch (e) {
                return new Error(e.message);
            }

            if (reservation.length) {
                this.id = reservation[0];
                return true;
            }
        }

        return false;
    }

    async save() {
        const freeTables = await this.getFreeTables();
        if (freeTables instanceof Error) {
            return freeTables;
        }
        if (freeTables.length) {
            let reservation;
            try {
                reservation = await knex('reservations')
                    .returning('id')
                    .insert({
                        table_id: freeTables[0].id,
                        start: this.time,
                        end: this.reservationEnd,
                        guests: this.guests
                    });
            } catch (e) {
                return new Error(e.message);

            }

            if (reservation.length) {
                this.id = reservation[0];
                return true;
            }
        }

        return false;
    }

    /**
     * Select reservation by id and join with table
     * @returns {Promise<*>}
     */
    async findOne() {
        let result;
        try {
            result = await knex('reservations')
                .select([
                    'reservations.id',
                    'reservations.guests',
                    'reservations.start',
                    'reservations.end',
                    'tables.number',
                    'tables.capacity'
                ])
                .where('reservations.id', this.id)
                .join('tables', 'tables.id', 'reservations.table_id')
                .limit(1);
        } catch (e) {
            console.log(e.message);
            return new Error(e.message);
        }

        if (!result.length) {
            return false;
        }
        return {
            reservation: {
                id: result[0].id,
                guests: result[0].guests,
                start: result[0].start,
                end: result[0].end,
                table: {
                    number: result[0].number,
                    capacity: result[0].capacity
                }
            }
        }
    }

    /**
     * Delete reservation by id
     * @returns {Promise<*>}
     */
    async deleteOne() {
        let result;
        try {
            result = !await knex('reservations').where('id', this.id).del();
        } catch (e) {
            console.log(e.message);
            return new Error(e.message);
        }

        return !result;
    }
}

module.exports = ReservationsModel;