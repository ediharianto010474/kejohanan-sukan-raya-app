
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEvent } from '@/contexts/EventContext';
import { useParticipant } from '@/contexts/ParticipantContext';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsContent as TabContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ParticipantRegistration = () => {
  const { isAdmin } = useAuth();
  const { selectedEvent } = useEvent();
  const { participants, fetchParticipants, addParticipant, updateParticipant, deleteParticipant, isLoading } = useParticipant();
  
  const [formData, setFormData] = useState({
    NAMA_KEJOHANAN: '',
    PASUKAN: '',
    NO_BADAN: '',
    KATEGORI: '',
    UMUR: '',
    NAMA_PESERTA: '',
    ACARA: [] as string[]
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filteredParticipants, setFilteredParticipants] = useState(participants);
  const [filters, setFilters] = useState({
    PASUKAN: '',
    KATEGORI: '',
    UMUR: ''
  });
  
  // Ensure participants are loaded when the component mounts
  useEffect(() => {
    if (selectedEvent) {
      fetchParticipants();
      setFormData(prev => ({
        ...prev,
        NAMA_KEJOHANAN: selectedEvent.NAMA_KEJOHANAN
      }));
    }
  }, [selectedEvent]);

  // Update filtered participants when participants or filters change
  useEffect(() => {
    filterParticipants();
  }, [participants, filters]);

  const filterParticipants = () => {
    let filtered = [...participants];
    
    if (filters.PASUKAN) {
      filtered = filtered.filter(p => p.PASUKAN === filters.PASUKAN);
    }
    
    if (filters.KATEGORI) {
      filtered = filtered.filter(p => p.KATEGORI === filters.KATEGORI);
    }
    
    if (filters.UMUR) {
      filtered = filtered.filter(p => p.UMUR === filters.UMUR);
    }
    
    setFilteredParticipants(filtered);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFilterChange = (name: string, value: string) => {
    setFilters({
      ...filters,
      [name]: value
    });
  };

  const handleAcaraChange = (acara: string, isChecked: boolean) => {
    let updatedAcara: string[];
    
    if (isChecked) {
      // Add event to the list
      updatedAcara = [...formData.ACARA, acara];
    } else {
      // Remove event from the list
      updatedAcara = formData.ACARA.filter(a => a !== acara);
    }
    
    // Validate event selection rules
    const individualEvents = updatedAcara.filter(a => 
      ['100M', '200M', '110M BERPAGAR', 'LOMPAT JAUH', 'LOMPAT TINGGI', 'LONTAR PELURU'].includes(a)
    );
    
    const teamEvents = updatedAcara.filter(a => 
      ['4X100M', '4X200M'].includes(a)
    );
    
    if (individualEvents.length > 2) {
      toast.warning('Peserta hanya boleh mengambil maksimum 2 acara individu');
      return;
    }
    
    if (teamEvents.length > 2) {
      toast.warning('Peserta hanya boleh mengambil maksimum 2 acara berkumpulan');
      return;
    }
    
    setFormData({
      ...formData,
      ACARA: updatedAcara
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.PASUKAN || !formData.NO_BADAN || !formData.KATEGORI || 
        !formData.UMUR || !formData.NAMA_PESERTA || formData.ACARA.length === 0) {
      toast.error('Sila lengkapkan semua maklumat peserta');
      return;
    }
    
    // Convert ACARA array to string
    const submissionData = {
      ...formData,
      ACARA: formData.ACARA.join(', ')
    };
    
    let success;
    
    if (isEditing && editingId) {
      success = await updateParticipant(editingId, submissionData);
      if (success) {
        toast.success('Maklumat peserta berjaya dikemaskini');
        setIsEditing(false);
        setEditingId(null);
      } else {
        toast.error('Gagal mengemaskini maklumat peserta');
      }
    } else {
      success = await addParticipant(submissionData);
      if (success) {
        toast.success('Peserta baru berjaya didaftarkan');
      } else {
        toast.error('Gagal mendaftarkan peserta');
      }
    }
    
    if (success) {
      // Reset form
      setFormData({
        NAMA_KEJOHANAN: selectedEvent?.NAMA_KEJOHANAN || '',
        PASUKAN: '',
        NO_BADAN: '',
        KATEGORI: '',
        UMUR: '',
        NAMA_PESERTA: '',
        ACARA: []
      });
    }
  };

  const handleEdit = (participant: any) => {
    // Convert ACARA string to array
    const acaraArray = participant.ACARA.split(', ').filter(Boolean);
    
    setFormData({
      NAMA_KEJOHANAN: participant.NAMA_KEJOHANAN,
      PASUKAN: participant.PASUKAN,
      NO_BADAN: participant.NO_BADAN,
      KATEGORI: participant.KATEGORI,
      UMUR: participant.UMUR,
      NAMA_PESERTA: participant.NAMA_PESERTA,
      ACARA: acaraArray
    });
    
    setIsEditing(true);
    setEditingId(participant.id);
  };

  const handleDelete = async (participantId: string) => {
    if (confirm('Adakah anda pasti ingin memadam rekod peserta ini?')) {
      const success = await deleteParticipant(participantId);
      if (success) {
        toast.success('Rekod peserta berjaya dipadam');
      } else {
        toast.error('Gagal memadam rekod peserta');
      }
    }
  };

  const handleReset = () => {
    if (isEditing) {
      setIsEditing(false);
      setEditingId(null);
    }
    
    setFormData({
      NAMA_KEJOHANAN: selectedEvent?.NAMA_KEJOHANAN || '',
      PASUKAN: '',
      NO_BADAN: '',
      KATEGORI: '',
      UMUR: '',
      NAMA_PESERTA: '',
      ACARA: []
    });
  };

  // Get unique values for filters
  const getUniqueValues = (field: keyof typeof filters) => {
    const values = new Set<string>();
    participants.forEach(p => {
      if (p[field]) values.add(p[field]);
    });
    return Array.from(values);
  };

  const uniquePasukan = getUniqueValues('PASUKAN');
  const uniqueKategori = getUniqueValues('KATEGORI');
  const uniqueUmur = getUniqueValues('UMUR');

  if (!selectedEvent) {
    return (
      <Layout requireAuth={true}>
        <div className="text-center">
          <p>Sila pilih kejohanan terlebih dahulu di halaman Maklumat Kejohanan.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout requireAuth={true}>
      <div className="space-y-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-athletic-secondary">
            Pendaftaran Peserta: {selectedEvent.NAMA_KEJOHANAN}
          </h1>
          <p className="text-muted-foreground">
            {selectedEvent.TARIKH_KEJOHANAN} | {selectedEvent.TEMPAT_KEJOHANAN}
          </p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{isEditing ? 'Kemaskini Maklumat Peserta' : 'Daftar Peserta Baru'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="PASUKAN">Pasukan</Label>
                  <Input
                    id="PASUKAN"
                    name="PASUKAN"
                    placeholder="Masukkan nama pasukan"
                    value={formData.PASUKAN}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="NO_BADAN">No. Badan</Label>
                  <Input
                    id="NO_BADAN"
                    name="NO_BADAN"
                    placeholder="Masukkan nombor badan"
                    value={formData.NO_BADAN}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="KATEGORI">Kategori</Label>
                  <Select
                    value={formData.KATEGORI}
                    onValueChange={(value) => handleSelectChange('KATEGORI', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="KATEGORI">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="LELAKI">LELAKI</SelectItem>
                      <SelectItem value="PEREMPUAN">PEREMPUAN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="UMUR">Umur</Label>
                  <Select
                    value={formData.UMUR}
                    onValueChange={(value) => handleSelectChange('UMUR', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="UMUR">
                      <SelectValue placeholder="Pilih umur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12 TAHUN">12 TAHUN</SelectItem>
                      <SelectItem value="11 TAHUN">11 TAHUN</SelectItem>
                      <SelectItem value="10 TAHUN">10 TAHUN</SelectItem>
                      <SelectItem value="9 TAHUN">9 TAHUN</SelectItem>
                      <SelectItem value="8 TAHUN">8 TAHUN</SelectItem>
                      <SelectItem value="7 TAHUN">7 TAHUN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="NAMA_PESERTA">Nama Peserta</Label>
                <Input
                  id="NAMA_PESERTA"
                  name="NAMA_PESERTA"
                  placeholder="Masukkan nama peserta"
                  value={formData.NAMA_PESERTA}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Acara (Maksimum 2 acara individu dan 2 acara berkumpulan)</Label>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium mb-2">Acara Individu:</p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="100m" 
                          checked={formData.ACARA.includes('100M')}
                          onCheckedChange={(checked) => handleAcaraChange('100M', checked === true)}
                        />
                        <Label htmlFor="100m">100M</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="200m" 
                          checked={formData.ACARA.includes('200M')}
                          onCheckedChange={(checked) => handleAcaraChange('200M', checked === true)}
                        />
                        <Label htmlFor="200m">200M</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="110m-berpagar" 
                          checked={formData.ACARA.includes('110M BERPAGAR')}
                          onCheckedChange={(checked) => handleAcaraChange('110M BERPAGAR', checked === true)}
                        />
                        <Label htmlFor="110m-berpagar">110M BERPAGAR</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="lompat-jauh" 
                          checked={formData.ACARA.includes('LOMPAT JAUH')}
                          onCheckedChange={(checked) => handleAcaraChange('LOMPAT JAUH', checked === true)}
                        />
                        <Label htmlFor="lompat-jauh">LOMPAT JAUH</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="lompat-tinggi" 
                          checked={formData.ACARA.includes('LOMPAT TINGGI')}
                          onCheckedChange={(checked) => handleAcaraChange('LOMPAT TINGGI', checked === true)}
                        />
                        <Label htmlFor="lompat-tinggi">LOMPAT TINGGI</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="lontar-peluru" 
                          checked={formData.ACARA.includes('LONTAR PELURU')}
                          onCheckedChange={(checked) => handleAcaraChange('LONTAR PELURU', checked === true)}
                        />
                        <Label htmlFor="lontar-peluru">LONTAR PELURU</Label>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <p className="font-medium mb-2">Acara Berkumpulan:</p>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="4x100m" 
                          checked={formData.ACARA.includes('4X100M')}
                          onCheckedChange={(checked) => handleAcaraChange('4X100M', checked === true)}
                        />
                        <Label htmlFor="4x100m">4X100M</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="4x200m" 
                          checked={formData.ACARA.includes('4X200M')}
                          onCheckedChange={(checked) => handleAcaraChange('4X200M', checked === true)}
                        />
                        <Label htmlFor="4x200m">4X200M</Label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-4">
                <Button type="submit" disabled={isLoading} className="flex-1">
                  {isLoading ? <Spinner size="sm" className="mr-2" /> : null}
                  {isEditing ? 'Kemaskini Peserta' : 'Daftar Peserta'}
                </Button>
                <Button type="button" variant="outline" onClick={handleReset} disabled={isLoading} className="flex-1">
                  {isEditing ? 'Batal' : 'Kosongkan'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Senarai Peserta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="text-sm font-medium mb-2">Filter:</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Select
                  value={filters.PASUKAN}
                  onValueChange={(value) => handleFilterChange('PASUKAN', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Pasukan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Semua Pasukan</SelectItem>
                    {uniquePasukan.map(pasukan => (
                      <SelectItem key={pasukan} value={pasukan}>{pasukan}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select
                  value={filters.KATEGORI}
                  onValueChange={(value) => handleFilterChange('KATEGORI', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Kategori" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Semua Kategori</SelectItem>
                    {uniqueKategori.map(kategori => (
                      <SelectItem key={kategori} value={kategori}>{kategori}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select
                  value={filters.UMUR}
                  onValueChange={(value) => handleFilterChange('UMUR', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Semua Umur" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Semua Umur</SelectItem>
                    {uniqueUmur.map(umur => (
                      <SelectItem key={umur} value={umur}>{umur}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Tabs defaultValue="table" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="table">Jadual</TabsTrigger>
                <TabsTrigger value="cards">Kad</TabsTrigger>
              </TabsList>
              
              <TabsContent value="table">
                {isLoading ? (
                  <div className="flex justify-center p-8">
                    <Spinner size="lg" />
                  </div>
                ) : filteredParticipants.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Tiada peserta didaftarkan atau tiada yang memenuhi kriteria filter
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-muted border-b">
                          <th className="py-2 px-2 text-left text-xs md:text-sm">Pasukan</th>
                          <th className="py-2 px-2 text-left text-xs md:text-sm">No. Badan</th>
                          <th className="py-2 px-2 text-left text-xs md:text-sm">Kategori</th>
                          <th className="py-2 px-2 text-left text-xs md:text-sm">Umur</th>
                          <th className="py-2 px-2 text-left text-xs md:text-sm">Nama Peserta</th>
                          <th className="py-2 px-2 text-left text-xs md:text-sm">Acara</th>
                          {isAdmin() && (
                            <th className="py-2 px-2 text-center text-xs md:text-sm">Tindakan</th>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredParticipants.map((participant) => (
                          <tr key={participant.id} className="border-b hover:bg-muted/50">
                            <td className="py-2 px-2 text-xs md:text-sm">{participant.PASUKAN}</td>
                            <td className="py-2 px-2 text-xs md:text-sm">{participant.NO_BADAN}</td>
                            <td className="py-2 px-2 text-xs md:text-sm">{participant.KATEGORI}</td>
                            <td className="py-2 px-2 text-xs md:text-sm">{participant.UMUR}</td>
                            <td className="py-2 px-2 text-xs md:text-sm">{participant.NAMA_PESERTA}</td>
                            <td className="py-2 px-2 text-xs md:text-sm">{participant.ACARA}</td>
                            {isAdmin() && (
                              <td className="py-2 px-2 text-center">
                                <div className="flex justify-center space-x-2">
                                  <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-7 text-xs"
                                    onClick={() => handleEdit(participant)}
                                  >
                                    Edit
                                  </Button>
                                  <Button 
                                    variant="destructive" 
                                    size="sm"
                                    className="h-7 text-xs"
                                    onClick={() => handleDelete(participant.id)}
                                  >
                                    Padam
                                  </Button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="cards">
                {isLoading ? (
                  <div className="flex justify-center p-8">
                    <Spinner size="lg" />
                  </div>
                ) : filteredParticipants.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Tiada peserta didaftarkan atau tiada yang memenuhi kriteria filter
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {filteredParticipants.map(participant => (
                      <Card key={participant.id} className="h-full">
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="font-bold">{participant.NAMA_PESERTA}</span>
                              <span className="text-sm bg-athletic-secondary text-white px-2 py-0.5 rounded-full">
                                {participant.NO_BADAN}
                              </span>
                            </div>
                            <div className="text-sm flex justify-between">
                              <span>{participant.PASUKAN}</span>
                              <span className="bg-athletic-primary/20 px-2 rounded">
                                {participant.KATEGORI} | {participant.UMUR}
                              </span>
                            </div>
                            <div>
                              <span className="text-xs text-muted-foreground">Acara:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {participant.ACARA.split(', ').map(acara => (
                                  <span key={acara} className="text-xs bg-athletic-accent/20 px-2 py-0.5 rounded">
                                    {acara}
                                  </span>
                                ))}
                              </div>
                            </div>
                            
                            {isAdmin() && (
                              <div className="flex justify-end space-x-2 pt-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleEdit(participant)}
                                >
                                  Edit
                                </Button>
                                <Button 
                                  variant="destructive" 
                                  size="sm"
                                  onClick={() => handleDelete(participant.id)}
                                >
                                  Padam
                                </Button>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default ParticipantRegistration;
