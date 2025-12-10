import { STORAGE_KEYS } from '../constants'
import { getStorage, setStorage } from '../utils/storage'

export const readVisibleKeys = (defaults) =>
  getStorage(STORAGE_KEYS.VISIBLE_KEYS, defaults)

export const writeVisibleKeys = (value) =>
  setStorage(STORAGE_KEYS.VISIBLE_KEYS, value)

export const readBidRecords = () =>
  getStorage(STORAGE_KEYS.BID_RECORDS, {})

export const writeBidRecords = (value) =>
  setStorage(STORAGE_KEYS.BID_RECORDS, value)

export const readFollowedIds = () =>
  getStorage(STORAGE_KEYS.FOLLOWED_IDS, {})

export const writeFollowedIds = (value) =>
  setStorage(STORAGE_KEYS.FOLLOWED_IDS, value)

export const readSavedSearches = () =>
  getStorage(STORAGE_KEYS.SAVED_SEARCHES, [])

export const writeSavedSearches = (value) =>
  setStorage(STORAGE_KEYS.SAVED_SEARCHES, value)
