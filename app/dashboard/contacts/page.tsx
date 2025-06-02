"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, Phone, RefreshCw, Search } from "lucide-react"
import { getContacts } from "@/db/contact"
import { Contact } from "@/models/Contact"


export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  const fetchContacts = async () => {
    setLoading(true)
    try {
      const contactsData = await getContacts()
      setContacts(contactsData)
      if (contactsData.length > 0 && !selectedContact) {
        setSelectedContact(contactsData[0])
      }
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Failed to fetch contacts:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContacts()
  }, [])

  const filteredContacts = contacts.filter(
    (contact) =>
      `${contact.firstName} ${contact.lastName || ""}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contact.company?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getAvatarUrl = (firstName: string, lastName?: string) => {
    const initials = `${firstName.charAt(0)}${lastName?.charAt(0) || ""}`.toUpperCase()
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=40&background=random&color=fff&bold=true`
  }

  const getLargeAvatarUrl = (firstName: string, lastName?: string) => {
    const initials = `${firstName.charAt(0)}${lastName?.charAt(0) || ""}`.toUpperCase()
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&size=120&background=random&color=fff&bold=true`
  }

  const formatDate = (date: Date) => {
    return (
      date.toLocaleDateString("en-US", {
        month: "numeric",
        day: "numeric",
        year: "numeric",
      }) +
      " at " +
      date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    )
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-80 border-r border-gray-700 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold mb-2">Contacts</h1>
          <div className="flex items-center justify-between text-sm mb-4">
            <span>Last updated on {formatDate(lastUpdated)}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchContacts}
              disabled={loading}
              className="text-blue-400 hover:text-blue-300 p-0 h-auto"
            >
              <RefreshCw className={`w-4 h-4 mr-1 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" />
            <Input
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-600 placeholder-gray-400"
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 text-center text-gray-400">Loading contacts...</div>
          ) : filteredContacts.length === 0 ? (
            <div className="p-4 text-center text-gray-400">No contacts found</div>
          ) : (
            filteredContacts.map((contact) => (
              <div
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`flex items-center p-4 cursor-pointer hover:bg-blue-100 border-b border-gray-200 ${
                  selectedContact?.id === contact.id ? "bg-blue-100 hover:bg-blue-200" : ""
                }`}
              >
                <Avatar className="w-10 h-10 mr-3">
                  <AvatarImage src={getAvatarUrl(contact.firstName, contact.lastName) || "/placeholder.svg"} />
                  <AvatarFallback>
                    {contact.firstName.charAt(0)}
                    {contact.lastName?.charAt(0) || ""}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {contact.firstName} {contact.lastName || ""}
                  </div>
                  {contact.company && <div className="text-sm text-gray-400 truncate">{contact.company}</div>}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {selectedContact ? (
          <div className="flex-1 p-8">
            <div className="max-w-2xl mx-auto">
              {/* Contact Header */}
              <div className="text-center mb-8">
                <Avatar className="w-32 h-32 mx-auto mb-4">
                  <AvatarImage
                    src={getLargeAvatarUrl(selectedContact.firstName, selectedContact.lastName) || "/placeholder.svg"}
                  />
                  <AvatarFallback className="text-2xl">
                    {selectedContact.firstName.charAt(0)}
                    {selectedContact.lastName?.charAt(0) || ""}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-3xl font-bold mb-2">
                  {selectedContact.firstName} {selectedContact.lastName || ""}
                </h2>
                {selectedContact.company && (
                  <Badge variant="secondary" className="mb-4">
                    {selectedContact.company}
                  </Badge>
                )}

                {/* Action Buttons */}
                <div className="flex justify-center gap-4 mb-8">
                  <Button size="lg" className="rounded-full">
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Message
                  </Button>
                  <Button size="lg" variant="outline" className="rounded-full">
                    <Phone className="w-5 h-5 mr-2" />
                    Call
                  </Button>
                </div>
              </div>

              {/* Contact Details */}
              <div className="space-y-6">
                {selectedContact.phoneNumber && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Mobile</h3>
                    <p className="text-gray-300">{selectedContact.phoneNumber}</p>
                  </div>
                )}

                {selectedContact.email && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Email</h3>
                    <p className="text-blue-400">{selectedContact.email}</p>
                  </div>
                )}

                {selectedContact.address && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Home</h3>
                    <p className="text-blue-400">{selectedContact.address}</p>
                  </div>
                )}

                {selectedContact.notes && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Work</h3>
                    <p className="text-blue-400">{selectedContact.notes}</p>
                  </div>
                )}

                {selectedContact.dob && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Date of Birth</h3>
                    <p className="text-gray-300">{selectedContact.dob}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-400">
            <div className="text-center">
              <h3 className="text-xl font-semibold mb-2">No Contact Selected</h3>
              <p>Select a contact from the sidebar to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
