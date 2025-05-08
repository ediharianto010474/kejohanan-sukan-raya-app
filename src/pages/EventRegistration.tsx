
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEvent } from '@/contexts/EventContext';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';
import { useNavigate } from 'react-router-dom';

const EventRegistration = () => {
  const { isAdmin } = useAuth();
  const { events, fetchEvents, isLoading, addEvent, selectEvent } = useEvent();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    NAMA_KEJOHANAN: '',
    TARIKH_KEJOHANAN: '',
    TEMPAT_KEJOHANAN: '',
    JUMLAH_LORONG_100M: 0,
    JUMLAH_LORONG_200M: 0,
    JUMLAH_LORONG_110M_BERPAGAR: 0
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    let processedValue: string | number = value;
    if (['JUMLAH_LORONG_100M', 'JUMLAH_LORONG_200M', 'JUMLAH_LORONG_110M_BERPAGAR'].includes(name)) {
      processedValue = value === '' ? 0 : parseInt(value);
    }
    
    setFormData({
      ...formData,
      [name]: processedValue
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!formData.NAMA_KEJOHANAN || !formData.TARIKH_KEJOHANAN || !formData.TEMPAT_KEJOHANAN) {
      toast.error('Sila lengkapkan semua maklumat kejohanan');
      return;
    }
    
    if (formData.JUMLAH_LORONG_100M <= 0 || formData.JUMLAH_LORONG_200M <= 0 || formData.JUMLAH_LORONG_110M_BERPAGAR <= 0) {
      toast.error('Jumlah lorong mestilah lebih dari sifar');
      return;
    }
    
    const success = await addEvent(formData);
    
    if (success) {
      toast.success('Maklumat kejohanan berjaya disimpan');
      // Reset form
      setFormData({
        NAMA_KEJOHANAN: '',
        TARIKH_KEJOHANAN: '',
        TEMPAT_KEJOHANAN: '',
        JUMLAH_LORONG_100M: 0,
        JUMLAH_LORONG_200M: 0,
        JUMLAH_LORONG_110M_BERPAGAR: 0
      });
    } else {
      toast.error('Gagal menyimpan maklumat kejohanan');
    }
  };

  const handleEventSelect = (eventId: string) => {
    selectEvent(eventId);
    toast.info('Kejohanan dipilih');
  };

  const handleGenerateHeats = () => {
    navigate('/generate-heats');
  };

  const handleGenerateFinals = () => {
    navigate('/generate-finals');
  };

  return (
    <Layout requireAuth={true}>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Daftar Maklumat Kejohanan</CardTitle>
          </CardHeader>
          <CardContent>
            {isAdmin() ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="NAMA_KEJOHANAN">Nama Kejohanan</Label>
                    <Input
                      id="NAMA_KEJOHANAN"
                      name="NAMA_KEJOHANAN"
                      placeholder="Masukkan nama kejohanan"
                      value={formData.NAMA_KEJOHANAN}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="TARIKH_KEJOHANAN">Tarikh Kejohanan</Label>
                    <Input
                      id="TARIKH_KEJOHANAN"
                      name="TARIKH_KEJOHANAN"
                      type="date"
                      value={formData.TARIKH_KEJOHANAN}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="TEMPAT_KEJOHANAN">Tempat Kejohanan</Label>
                  <Input
                    id="TEMPAT_KEJOHANAN"
                    name="TEMPAT_KEJOHANAN"
                    placeholder="Masukkan tempat kejohanan"
                    value={formData.TEMPAT_KEJOHANAN}
                    onChange={handleChange}
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="JUMLAH_LORONG_100M">Jumlah Lorong 100M</Label>
                    <Input
                      id="JUMLAH_LORONG_100M"
                      name="JUMLAH_LORONG_100M"
                      type="number"
                      min="1"
                      value={formData.JUMLAH_LORONG_100M || ''}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="JUMLAH_LORONG_200M">Jumlah Lorong 200M</Label>
                    <Input
                      id="JUMLAH_LORONG_200M"
                      name="JUMLAH_LORONG_200M"
                      type="number"
                      min="1"
                      value={formData.JUMLAH_LORONG_200M || ''}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="JUMLAH_LORONG_110M_BERPAGAR">Jumlah Lorong 110M Berpagar</Label>
                    <Input
                      id="JUMLAH_LORONG_110M_BERPAGAR"
                      name="JUMLAH_LORONG_110M_BERPAGAR"
                      type="number"
                      min="1"
                      value={formData.JUMLAH_LORONG_110M_BERPAGAR || ''}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Spinner size="sm" className="mr-2" /> : null}
                  Simpan Maklumat
                </Button>
              </form>
            ) : (
              <div className="bg-muted p-4 rounded text-center">
                <p>Anda tidak mempunyai kebenaran untuk menambah kejohanan baru. Sila pilih kejohanan dari senarai di bawah.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Senarai Kejohanan</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center p-8">
                <Spinner size="lg" />
              </div>
            ) : events.length === 0 ? (
              <p className="text-center text-muted-foreground">Tiada kejohanan didaftarkan</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-muted border-b">
                      <th className="py-2 px-4 text-left">Nama Kejohanan</th>
                      <th className="py-2 px-4 text-left">Tarikh</th>
                      <th className="py-2 px-4 text-left">Tempat</th>
                      <th className="py-2 px-4 text-center">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((event) => (
                      <tr key={event.id} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-4">
                          <Button
                            variant="link"
                            className="p-0 h-auto text-athletic-primary font-medium"
                            onClick={() => handleEventSelect(event.id)}
                          >
                            {event.NAMA_KEJOHANAN}
                          </Button>
                        </td>
                        <td className="py-2 px-4">{event.TARIKH_KEJOHANAN}</td>
                        <td className="py-2 px-4">{event.TEMPAT_KEJOHANAN}</td>
                        <td className="py-2 px-4 text-center">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEventSelect(event.id)}
                          >
                            Pilih
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {isAdmin() && (
          <div className="flex flex-col md:flex-row gap-4">
            <Button 
              onClick={handleGenerateHeats} 
              className="bg-athletic-primary hover:bg-athletic-primary/80 w-full md:w-auto"
              disabled={!useEvent().selectedEvent}
            >
              Jana Acara Saringan
            </Button>
            <Button 
              onClick={handleGenerateFinals}
              className="bg-athletic-secondary hover:bg-athletic-secondary/80 w-full md:w-auto"
              disabled={!useEvent().selectedEvent}
            >
              Jana Acara Akhir
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default EventRegistration;
